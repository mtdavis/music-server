const Promise = require("bluebird");
const walk = require("walk");
const path = require("path");
const fs = Promise.promisifyAll(require("fs"));

const MusicServerDb = require("./music-server-db").MusicServerDb;
const db = new MusicServerDb();
const musicServerSettings = require("./music-server-settings.json");
const util = require("./music-server-util");

function checkForChangedMetadata(root, fileStats, next) {
    const absolutePath = path.join(root, fileStats.name);
    const extension = path.extname(fileStats.name);
    const pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    function maybeUpdateTrackFromMetadataAsync(fileMetadata, dbTrack) {
        const metadataTitle = fileMetadata.title;
        const metadataArtist = fileMetadata.artist[0];
        const metadataAlbumArtist = fileMetadata.albumartist[0];
        const metadataAlbum = fileMetadata.album;
        const metadataYear = fileMetadata.year ? Number(fileMetadata.year) : null;
        const metadataTrackNumber = fileMetadata.track.no ? fileMetadata.track.no : null;
        const metadataGenre = fileMetadata.genre[0];

        if(metadataTitle !== dbTrack.title ||
            metadataArtist !== dbTrack.artist ||
            metadataAlbumArtist !== dbTrack.album_artist ||
            metadataAlbum !== dbTrack.album ||
            metadataYear !== dbTrack.year ||
            metadataTrackNumber !== dbTrack.track_number ||
            metadataGenre !== dbTrack.genre) {
            dbTrack.title = metadataTitle;
            dbTrack.artist = metadataArtist;
            dbTrack.album_artist = metadataAlbumArtist;
            dbTrack.album = metadataAlbum;
            dbTrack.year = metadataYear;
            dbTrack.track_number = metadataTrackNumber;
            dbTrack.genre = metadataGenre;

            return db.updateTrackFromMetadataAsync(dbTrack);
        }
        else {
            return util.dummyPromise();
        }
    }

    if(extension === ".mp3" || extension === ".m4a") {
        process.stdout.write(".");

        Promise.join(
            util.getMetadataAsync(absolutePath, {duration: false}),
            db.selectTrackByPathAsync(pathRelativeToMusicRoot)
        ).spread(function(fileMetadata, dbTrack) {
            if(fileMetadata && dbTrack) {
                return maybeUpdateTrackFromMetadataAsync(fileMetadata, dbTrack);
            }
            else {
                return util.dummyPromise();
            }
        }).catch(function(error) {
            console.error(absolutePath);
            console.error(error);
        }).finally(next);
    }
    else {
        next();
    }
}

function checkForNewFile(root, fileStats, next) {
    const absolutePath = path.join(root, fileStats.name);
    const extension = path.extname(fileStats.name);
    const pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    function addTrackFromMetadataAsync(fileMetadata) {
        const metadataTitle = fileMetadata.title;
        const metadataArtist = fileMetadata.artist[0];
        const metadataAlbumArtist = fileMetadata.albumartist[0];
        const metadataAlbum = fileMetadata.album;
        const metadataYear = fileMetadata.year ? Number(fileMetadata.year) : null;
        const metadataTrackNumber = fileMetadata.track.no ? fileMetadata.track.no : null;
        const metadataGenre = fileMetadata.genre[0] || "";
        const metadataDuration = fileMetadata.duration;

        const dbTrack = {};
        dbTrack.title = metadataTitle;
        dbTrack.artist = metadataArtist;
        dbTrack.album_artist = metadataAlbumArtist;
        dbTrack.album = metadataAlbum;
        dbTrack.year = metadataYear;
        dbTrack.track_number = metadataTrackNumber;
        dbTrack.genre = metadataGenre;
        dbTrack.duration = metadataDuration;
        dbTrack.path = pathRelativeToMusicRoot;

        return db.addTrackFromMetadataAsync(dbTrack);
    }

    if(extension === ".mp3" || extension === ".m4a") {
        process.stdout.write(".");

        db.selectTrackByPathAsync(pathRelativeToMusicRoot).then(function(dbTrack) {
            if(dbTrack) {
                next();
            }
            else {
                process.stdout.write("<" + pathRelativeToMusicRoot + ">");
                util.getMetadataAsync(absolutePath, {duration: true}).
                    then(addTrackFromMetadataAsync).
                    then(next);
            }
        });
    }
    else {
        next();
    }
}

function checkForMovedFile(root, fileStats, next) {
    const absolutePath = path.join(root, fileStats.name);
    const extension = path.extname(fileStats.name);
    const pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    function maybeUpdatePathAsync(dbTrack) {
        if(dbTrack && dbTrack.path !== pathRelativeToMusicRoot) {
            return db.updateTrackPathAsync(dbTrack.id, pathRelativeToMusicRoot);
        }
        else {
            return util.dummyPromise();
        }
    }

    if(extension === ".mp3" || extension === ".m4a") {
        process.stdout.write(".");

        db.selectTrackByPathAsync(pathRelativeToMusicRoot).then(function(dbTrack) {
            if(dbTrack) {
                next();
            }
            else {
                util.getMetadataAsync(absolutePath).then(function(fileMetadata) {
                    return db.selectTrackByInfoAsync({
                        title: fileMetadata.title,
                        artist: fileMetadata.artist[0],
                        album: fileMetadata.album,
                        album_artist: fileMetadata.albumartist[0],
                        track_number: fileMetadata.track.no ? fileMetadata.track.no : null,
                        year: fileMetadata.year ? Number(fileMetadata.year) : null
                    });
                }).then(maybeUpdatePathAsync).then(next);
            }
        });
    }
    else {
        next();
    }
}

function checkForRestruction(root, fileStats, next) {
    const actualAbsolutePath = path.join(root, fileStats.name);
    const extension = path.extname(fileStats.name);

    if(extension === ".mp3" || extension === ".m4a") {
        process.stdout.write(".");

        let expectedRelativeDir;
        let expectedFilename;

        util.getMetadataAsync(actualAbsolutePath).then(function(metadata) {
            if(metadata.album) {
                expectedRelativeDir = path.join(
                    util.escapeForFileSystem(metadata.artist[0]),
                    util.escapeForFileSystem(metadata.album));
                expectedFilename = metadata.track.no + ". " +
                    util.escapeForFileSystem(metadata.title, {leadingTrailing: false}) +
                    extension;
            }
            else {
                expectedRelativeDir = path.join(
                    util.escapeForFileSystem(metadata.artist[0]),
                    "(No Album)");
                expectedFilename = util.escapeForFileSystem(metadata.title) + extension;
            }

            const expectedAbsoluteDir = path.join(
                musicServerSettings.files.base_stream_path,
                expectedRelativeDir);

            const expectedAbsolutePath = path.join(
                musicServerSettings.files.base_stream_path,
                expectedRelativeDir,
                expectedFilename);

            if(actualAbsolutePath.toLowerCase() !== expectedAbsolutePath.toLowerCase()) {
                try {
                    console.log(expectedAbsolutePath);
                    if(!fs.existsSync(expectedAbsoluteDir)) {
                        fs.mkdirSync(expectedAbsoluteDir);
                    }
                    fs.renameSync(actualAbsolutePath, expectedAbsolutePath);
                }
                catch(error) {
                    console.error(error);
                }
            }

            next();
        });
    }
    else if(extension === ".jpg") {
        const albumName = path.basename(actualAbsolutePath, ".jpg");
        const actualDirectory = path.dirname(actualAbsolutePath);
        const actualDirectoryName = path.basename(actualDirectory);

        if(albumName !== actualDirectoryName) {
            const expectedAbsoluteDir = path.join(actualDirectory, util.escapeForFileSystem(albumName));

            if(!fs.existsSync(expectedAbsoluteDir)) {
                fs.mkdirSync(expectedAbsoluteDir);
            }

            const expectedPath = path.join(expectedAbsoluteDir, util.escapeForFileSystem(albumName) + ".jpg");
            fs.renameSync(actualAbsolutePath, expectedPath);
        }
        next();
    }
    else {
        next();
    }
}

function scanAsync(fileHandler) {
    return new Promise(function(resolve, reject) {
        walker = walk.walk(musicServerSettings.files.base_stream_path, {
            filters: [
                /\$New/
            ]
        });

        walker.on("file", fileHandler);
        walker.on("end", resolve);
    });
}

function scanForChangedMetadataAsync() {
    return scanAsync(checkForChangedMetadata);
}

function scanForNewFilesAsync() {
    return scanAsync(checkForNewFile);
}

function scanForMovedFilesAsync() {
    return scanAsync(checkForMovedFile);
}

module.exports = {
    scanForChangedMetadataAsync: scanForChangedMetadataAsync,
    scanForNewFilesAsync: scanForNewFilesAsync,
    scanForMovedFilesAsync: scanForMovedFilesAsync
};

function restructureAsync() {
    return scanAsync(checkForRestruction);
}
