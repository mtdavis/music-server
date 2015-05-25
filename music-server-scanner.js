var Promise = require("bluebird");
var walk = require("walk");
var path = require("path");
var fs = Promise.promisifyAll(require("fs"));

var db = require("./music-server-db").MusicServerDb();
var musicServerSettings = require("./music-server-settings.json");
var util = require("./music-server-util");

var checkForChangedMetadata = function(root, fileStats, next)
{
    var absolutePath = path.join(root, fileStats.name);
    var extension = path.extname(fileStats.name);
    var pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    var maybeUpdateTrackFromMetadataAsync = function(fileMetadata, dbTrack)
    {
        var metadataTitle = fileMetadata.title;
        var metadataArtist = fileMetadata.artist[0];
        var metadataAlbumArtist = fileMetadata.albumartist[0];
        var metadataAlbum = fileMetadata.album;
        var metadataYear = fileMetadata.year ? Number(fileMetadata.year) : null;
        var metadataTrackNumber = fileMetadata.track.no ? fileMetadata.track.no : null;
        var metadataGenre = fileMetadata.genre[0];

        if(metadataTitle !== dbTrack.title ||
            metadataArtist !== dbTrack.artist ||
            metadataAlbumArtist !== dbTrack.album_artist ||
            metadataAlbum !== dbTrack.album ||
            metadataYear !== dbTrack.year ||
            metadataTrackNumber !== dbTrack.track_number ||
            metadataGenre !== dbTrack.genre)
        {
            console.log(fileMetadata, dbTrack);
            dbTrack.title = metadataTitle;
            dbTrack.artist = metadataArtist;
            dbTrack.album_artist = metadataAlbumArtist;
            dbTrack.album = metadataAlbum;
            dbTrack.year = metadataYear;
            dbTrack.track_number = metadataTrackNumber;
            dbTrack.genre = metadataGenre;

            return db.updateTrackFromMetadataAsync(dbTrack);
        }
        else
        {
            return util.dummyPromise();
        }
    }

    if(extension === ".mp3" || extension === ".m4a")
    {
        process.stdout.write(".");

        Promise.join(
            util.getMetadataAsync(absolutePath, {duration: false}),
            db.selectTrackByPathAsync(pathRelativeToMusicRoot)
        ).spread(function(fileMetadata, dbTrack)
        {
            if(fileMetadata && dbTrack)
            {
                return maybeUpdateTrackFromMetadataAsync(fileMetadata, dbTrack);
            }
            else
            {
                return util.dummyPromise()
            }
        }).then(next);
    }
    else
    {
        next();
    }
}

var checkForNewFile = function(root, fileStats, next)
{
    var absolutePath = path.join(root, fileStats.name);
    var extension = path.extname(fileStats.name);
    var pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    var addTrackFromMetadataAsync = function(fileMetadata)
    {
        var metadataTitle = fileMetadata.title;
        var metadataArtist = fileMetadata.artist[0];
        var metadataAlbumArtist = fileMetadata.albumartist[0];
        var metadataAlbum = fileMetadata.album;
        var metadataYear = fileMetadata.year ? Number(fileMetadata.year) : null;
        var metadataTrackNumber = fileMetadata.track.no ? fileMetadata.track.no : null;
        var metadataGenre = fileMetadata.genre[0] || "";
        var metadataDuration = fileMetadata.duration;

        var dbTrack = {};
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

    if(extension === ".mp3" || extension === ".m4a")
    {
        process.stdout.write(".");

        db.selectTrackByPathAsync(pathRelativeToMusicRoot).then(function(dbTrack)
        {
            if(dbTrack)
            {
                next();
            }
            else
            {
                util.getMetadataAsync(absolutePath, {duration: true}).
                    then(addTrackFromMetadataAsync).
                    then(next);
            }
        });
    }
    else
    {
        next();
    }
}

var checkForMovedFile = function(root, fileStats, next)
{
    var absolutePath = path.join(root, fileStats.name);
    var extension = path.extname(fileStats.name);
    var pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, absolutePath).replace(/\\/g, "/");

    var maybeUpdatePathAsync = function(dbTrack)
    {
        if(dbTrack && dbTrack.path !== pathRelativeToMusicRoot)
        {
            return db.updateTrackPathAsync(dbTrack.id, pathRelativeToMusicRoot);
        }
        else
        {
            return util.dummyPromise();
        }
    }

    if(extension === ".mp3" || extension === ".m4a")
    {
        process.stdout.write(".");

        db.selectTrackByPathAsync(pathRelativeToMusicRoot).then(function(dbTrack) {
            if(dbTrack)
            {
                next();
            }
            else
            {
                util.getMetadataAsync(absolutePath).then(function(fileMetadata)
                {
                    return db.selectTrackByInfoAsync({
                        title: fileMetadata.title,
                        artist: fileMetadata.artist[0],
                        album: fileMetadata.album,
                        track_number: fileMetadata.track.no ? fileMetadata.track.no : null,
                        year: fileMetadata.year ? Number(fileMetadata.year) : null
                    });
                }).then(maybeUpdatePathAsync).then(next);
            }
        });
    }
    else
    {
        next();
    }
}

var checkForRestruction = function(root, fileStats, next)
{
    var actualAbsolutePath = path.join(root, fileStats.name);
    var extension = path.extname(fileStats.name);
    var pathRelativeToMusicRoot = path.relative(
        musicServerSettings.files.base_stream_path, actualAbsolutePath);

    if(extension === ".mp3" || extension === ".m4a")
    {
        process.stdout.write(".");

        var expectedRelativeDir;
        var expectedFilename;

        util.getMetadataAsync(actualAbsolutePath).then(function(metadata)
        {
            if(metadata.album)
            {
                expectedRelativeDir = path.join(
                    util.escapeForFileSystem(metadata.artist[0]),
                    util.escapeForFileSystem(metadata.album));
                expectedFilename = metadata.track.no + ". " + util.escapeForFileSystem(metadata.title, {leadingTrailing: false}) + extension;
            }
            else
            {
                expectedRelativeDir = path.join(
                    util.escapeForFileSystem(metadata.artist[0]),
                    "(No Album)");
                expectedFilename = util.escapeForFileSystem(metadata.title) + extension;
            }

            var expectedAbsoluteDir = path.join(
                musicServerSettings.files.base_stream_path,
                expectedRelativeDir);

            var expectedAbsolutePath = path.join(
                musicServerSettings.files.base_stream_path,
                expectedRelativeDir,
                expectedFilename);

            if(actualAbsolutePath.toLowerCase() !== expectedAbsolutePath.toLowerCase())
            {
                try
                {
                    console.log(expectedAbsolutePath);
                    if(!fs.existsSync(expectedAbsoluteDir))
                    {
                        fs.mkdirSync(expectedAbsoluteDir);
                    }
                    fs.renameSync(actualAbsolutePath, expectedAbsolutePath);
                }
                catch(error)
                {
                    console.error(error);
                }
            }

            next();
        });
    }
    else if(extension === ".jpg")
    {
        var albumName = path.basename(actualAbsolutePath, ".jpg");
        var actualDirectory = path.dirname(actualAbsolutePath);
        var actualDirectoryName = path.basename(actualDirectory);

        if(albumName !== actualDirectoryName)
        {
            var expectedAbsoluteDir = path.join(actualDirectory, util.escapeForFileSystem(albumName));

            if(!fs.existsSync(expectedAbsoluteDir))
            {
                fs.mkdirSync(expectedAbsoluteDir);
            }

            var expectedPath = path.join(expectedAbsoluteDir, util.escapeForFileSystem(albumName) + ".jpg");
            fs.renameSync(actualAbsolutePath, expectedPath);
        }
        next();
    }
    else
    {
        next();
    }
}

var scanAsync = function(fileHandler)
{
    return new Promise(function(resolve, reject)
    {
        walker = walk.walk(musicServerSettings.files.base_stream_path, {
            filters: ["New"]
        });

        walker.on("file", fileHandler);
        walker.on("end", resolve);
    });
}

var scanForChangedMetadataAsync = function()
{
    return scanAsync(checkForChangedMetadata);
}

var scanForNewFilesAsync = function()
{
    return scanAsync(checkForNewFile);
}

var scanForMovedFilesAsync = function()
{
    return scanAsync(checkForMovedFile);
}

module.exports = {
    scanForChangedMetadataAsync: scanForChangedMetadataAsync,
    scanForNewFilesAsync: scanForNewFilesAsync,
    scanForMovedFilesAsync: scanForMovedFilesAsync
};

var restructureAsync = function()
{
    return scanAsync(checkForRestruction);
}
