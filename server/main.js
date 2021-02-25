const Promise = require("bluebird");
const connect = require("connect");
const compression = require("compression");
const http = require("http");
const https = require("https");
const serveStatic = require("serve-static");
const connectRoute = require("connect-route");
const url = require("url");
const bodyParser = require("body-parser");
const musicServerSettings = require("../music-server-settings.json");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");
const lyricist = Promise.promisifyAll(require("lyricist")(musicServerSettings.genius.access_token));
const domain = require("domain");

const MusicServerDb = require("./music-server-db").MusicServerDb;
const db = new MusicServerDb();
const lastfm = require("./music-server-lastfm").MusicServerLastfm();
const util = require("./music-server-util");
const scanner = require("./music-server-scanner");
const connectLimitBandwidth = require("./connect-limit-bandwidth");

function initRouter() {
    const result = connectRoute(function(router) {
        router.get("/demo-mode", demoModeHandler())
        router.get("/albums", albumsHandler());
        router.get("/tracks", tracksHandler());
        router.get("/album-art", albumArtHandler());
        router.get("/shuffle", shuffleHandler());
        router.get("/lyrics", lyricsHandler());
        router.get("/playlists", playlistsHandler());
        router.get("/playlist-tracks", playlistTracksHandler());
        router.post("/submit-play", submitPlayHandler());
        router.post("/submit-now-playing", submitNowPlayingHandler());
        router.post("/tools/scan-for-changed-metadata", scanForChangedMetadataHandler());
        router.post("/tools/scan-for-new-files", scanForNewFilesHandler());
        router.post("/tools/scan-for-moved-files", scanForMovedFilesHandler());
    });

    return result;
}

function selectFromDb(lastModifiedSql, selectSql, {
    lastModifiedSqlParamsBuilder, selectSqlParamsBuilder
}) {
    return async function(req, res, next) {
        console.log(req.url);

        try {
            let ifModifiedSince = null;
            if(req.headers["if-modified-since"]) {
                ifModifiedSince = new Date(req.headers["if-modified-since"]);
            }

            let lastModifiedSqlParams = {};
            if(lastModifiedSqlParamsBuilder) {
                lastModifiedSqlParams = lastModifiedSqlParamsBuilder(req);
            }

            let selectSqlParams = {};
            if(selectSqlParamsBuilder) {
                selectSqlParams = selectSqlParamsBuilder(req);
            }

            const {notModified, lastModified, rows} = await db.allIfModifiedSince(
                lastModifiedSql, selectSql,
                {ifModifiedSince, lastModifiedSqlParams, selectSqlParams}
            );

            if(notModified) {
                res.writeHead(304, {
                    "Last-Modified": lastModified.toUTCString()
                });
                res.end();
            }
            else {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Pragma": "Public",
                    "Last-Modified": lastModified.toUTCString()
                });
                res.end(JSON.stringify(rows));
            }

        }
        catch(error) {
            console.error(error);
            res.statusCode = 500;
            res.end();
        }
    };
}

function demoModeHandler() {
    return function(req, res, next) {
        res.writeHead(200, {
            "Content-Type": "application/json",
        });
        res.end(JSON.stringify(musicServerSettings.demoMode));
    };
}

function albumsHandler() {
    const lastModifiedSql = "SELECT max(last_modified) as last_modified FROM album_view";

    const albumsSql = "SELECT id, artist AS album_artist, title AS album, genre, duration, " +
        "tracks, year, release_date, last_play, play_count " +
        "FROM album_view";

    return selectFromDb(lastModifiedSql, albumsSql, {});
}

function tracksHandler() {
    const lastModifiedSql = "SELECT max(last_modified) as last_modified " +
        "FROM track_view " +
        "WHERE album_id = $album_id OR $album_id IS NULL";

    const tracksSql =
        "SELECT id, title, artist, album, album_id, genre, track_number, release_date, " +
        "duration, path, last_play, play_count, last_modified, year " +
        "FROM track_view " +
        "WHERE album_id = $album_id OR $album_id IS NULL " +
        "ORDER BY album, track_number";

    function sqlParamsBuilder(req) {
        const query = url.parse(req.url, true).query;

        return {
            $album_id: query.album_id || null
        };
    }

    return selectFromDb(lastModifiedSql, tracksSql, {
        lastModifiedSqlParamsBuilder: sqlParamsBuilder,
        selectSqlParamsBuilder: sqlParamsBuilder
    });
}

function playlistsHandler() {
    const lastModifiedSql = "SELECT MAX(last_modified) " +
        "FROM playlist_view;";

    const playlistsSql = "SELECT id, title, tracks, duration, last_play, play_count " +
        "FROM playlist_view;";

    return selectFromDb(lastModifiedSql, playlistsSql, {});
}

function playlistTracksHandler() {
    const lastModifiedSql = "SELECT $current_time AS last_modified;";

    const tracksSql =
        "SELECT id, title, artist, album, album_id, genre, track_number, release_date, " +
        "duration, path, last_play, play_count, last_modified, year " +
        "FROM track_view " +
        "LEFT JOIN playlist_track ON track_view.id = playlist_track.track_id " +
        "WHERE playlist_track.playlist_id = $playlist_id " +
        "ORDER BY (" +
        "   CASE WHEN playlist_track.`order` IS NULL THEN RANDOM() ELSE playlist_track.`order` END" +
        ");";

    function tracksSqlParamsBuilder(req) {
        const query = url.parse(req.url, true).query;
        return {
            $playlist_id: query.playlist_id,
        };
    }

    function lastModifiedSqlParamsBuilder() {
        return {
            $current_time: Math.floor(Date.now() / 1000)
        };
    }

    return selectFromDb(lastModifiedSql, tracksSql, {
        lastModifiedSqlParamsBuilder: lastModifiedSqlParamsBuilder,
        selectSqlParamsBuilder: tracksSqlParamsBuilder
    });
}

function lyricsHandler() {
    return function(req, res, next) {
        const dom = domain.create();

        dom.on('error', function(error) {
            console.trace(error);
            res.statusCode = 500;
            res.end();
        });

        const query = url.parse(req.url, true).query;
        const trackId = query.id;

        dom.run(function() {
            db.selectTrackByIdAsync(trackId).then(function(track) {
                const search = track.artist + ' ' + track.title;
                return lyricist.songAsync({search: search});
            }).then(function(song) {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                });
                res.end(JSON.stringify({
                    lyrics: song.lyrics.trim(),
                    url: song.url
                }));
            }).catch(function(error) {
                console.trace(error);
                res.statusCode = 500;
                res.end();
            });
        });
    };
}

function shuffleHandler() {
    const lastModifiedSql = "SELECT MAX(strftime('%s', 'now')) AS last_modified";

    const shuffleSql = "SELECT * FROM track_view " +
        "WHERE (play_count >= 5) AND (duration >= 50) AND (duration < 1000) " +
        "AND (last_play < strftime('%s', 'now') - 90*24*60*60) " +
        "AND (album = '' OR album NOT IN (" +
        "    SELECT title FROM album_view WHERE play_count >= 5 " +
        ")) " +
        "ORDER BY last_play";

    return selectFromDb(lastModifiedSql, shuffleSql, {});
}

function albumArtHandler() {
    return async function(req, res, next) {
        try {
            console.log(req.url);
            const query = url.parse(req.url, true).query;
            const trackId = query.id;

            let ifModifiedSince = null;
            if(req.headers["if-modified-since"]) {
                ifModifiedSince = new Date(req.headers["if-modified-since"]);
            }

            const track = await db.selectTrackByIdAsync(trackId);

            // find path to mp3
            const relativeTrackPath = track.path;
            const relativeTrackDirectory = path.dirname(relativeTrackPath);
            const relativeExpectedArtPathJpg = path.join(relativeTrackDirectory,
                util.escapeForFileSystem(track.album) + ".jpg");
            const relativeExpectedArtPathPng = path.join(relativeTrackDirectory,
                util.escapeForFileSystem(track.album) + ".png");

            const fullTrackPath = path.join(musicServerSettings.files.base_stream_path, relativeTrackPath);

            const [mp3Stat, jpgExists, pngExists, metadata] = await Promise.join(
                fs.statAsync(fullTrackPath),
                util.fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathJpg)),
                util.fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathPng)),
                util.getMetadataAsync(fullTrackPath));

            // if file exists... forward to the static address
            // it will handle caching info
            if(jpgExists) {
                res.writeHead(303, {
                    "Location":encodeURI("/art/" + relativeExpectedArtPathJpg.replace(/\\/g, "/"))
                });
                res.end();
            }
            else if(pngExists) {
                res.writeHead(303, {
                    "Location":encodeURI("/art/" + relativeExpectedArtPathPng.replace(/\\/g, "/"))
                });
                res.end();
            }
            else if(metadata.picture && metadata.picture.length > 0) {
                let contentType;

                if(metadata.picture[0].format === "jpg") {
                    contentType = "image/JPEG";
                }
                else {
                    // don't send a content type; maybe the browser can figure it out
                    console.log("Unexpected album art format: " + metadata.picture[0].format);
                }

                if(ifModifiedSince &&
                    ifModifiedSince.getTime() === mp3Stat.mtime.getTime()) {
                    res.writeHead(304, {
                        "Last-Modified": mp3Stat.mtime.toUTCString()
                    });
                    res.end();
                }
                else {
                    res.writeHead(200, {
                        "Content-Type": contentType,
                        "Pragma": "Public",
                        "Last-Modified": mp3Stat.mtime.toUTCString()
                    });
                    res.end(metadata.picture[0].data);
                }
            }
            else {
                res.statusCode = 404;
                res.end();
            }
        }
        catch(error) {
            console.trace(error);
            res.statusCode = 500;
            res.end();
        }
    };
}

function submitPlayHandler() {
    return async function(req, res, next) {
        console.log(req.url, req.body);
        const trackId = Number.parseInt(req.body.id, 10);

        const currentTime = Math.floor(Date.now() / 1000);
        const timestamp = Number.parseInt(req.body.started_playing, 10) || currentTime;
        const track = await db.selectTrackByIdAsync(trackId);

        db.submitPlay(trackId, timestamp, false);

        if(track.owner === 'mike' && !musicServerSettings.demoMode) {
            try {
                await lastfm.doScrobbleAsync({
                    method: 'track.scrobble',
                    artist: track.artist,
                    track: track.title,
                    timestamp: timestamp,
                    album: track.album,
                    trackNumber: track.track_number,
                    duration: track.duration
                });

                await db.markPlayScrobbled(trackId, timestamp);
            }
            catch(error) {
                console.error('scrobble error; will try again later');
            }
        }
        else {
            console.log('not scrobbling; owner = ' + track.owner);
        }

        res.statusCode = 200;
        res.end();
    };
}

function submitNowPlayingHandler() {
    return async function(req, res, next) {
        console.log(req.url, req.body);
        const trackId = Number.parseInt(req.body.id, 10);
        const track = await db.selectTrackByIdAsync(trackId);

        if(track.owner === 'mike' && !musicServerSettings.demoMode) {
            try {
                await lastfm.doScrobbleAsync({
                    method: 'track.updateNowPlaying',
                    artist: track.artist,
                    track: track.title,
                    album: track.album,
                    trackNumber: track.track_number,
                    duration: track.duration
                });
            }
            catch(error) {
                console.error(error);
            }
        }

        res.statusCode = 200;
        res.end();
    };
}

function scanForChangedMetadataHandler() {
    return scanHandler(scanner.scanForChangedMetadataAsync);
}

function scanForMovedFilesHandler() {
    return scanHandler(scanner.scanForMovedFilesAsync);
}

function scanForNewFilesHandler() {
    return scanHandler(scanner.scanForNewFilesAsync);
}

function scanHandler(scanFunction) {
    return function(req, res, next) {
        console.log(req.url);

        scanFunction().then(function() {
            res.statusCode = 200;
            res.end();
        }).catch(function(error) {
            console.error(error);
            res.statusCode = 500;
            res.end();
        });
    };
}

function startServer(router) {
    const app = connect();

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(connectLimitBandwidth(musicServerSettings.throttleRate));
    app.use(compression());

    app.use("/stream", serveStatic(musicServerSettings.files.base_stream_path));
    app.use("/art", serveStatic(musicServerSettings.files.base_stream_path, {
        maxAge: '365d'
    }));
    app.use("/", serveStatic("../client/dist"));
    app.use(router);

    app.use(function(req, res, next) {
        res.statusCode = 404;
        res.end("404");
    });

    const options = {
        key: fs.readFileSync(musicServerSettings.files.priv_key),
        cert: fs.readFileSync(musicServerSettings.files.cert)
    };

    https.createServer(options, app).listen(443);

    const httpApp = connect();

    // for letsencrypt
    httpApp.use("/.well-known", serveStatic(".well-known"));

    httpApp.use("/", function(req, res, next) {
        res.writeHead(303, {
            "Location":"https://" + req.headers.host
        });
        res.end();
    });

    http.createServer(httpApp).listen(80);
}

async function checkScrobbleBacklog() {
    const track = await db.getTrackFromScrobbleBacklog();

    if(track) {
        try{
            await lastfm.doScrobbleAsync({
                method: 'track.scrobble',
                artist: track.artist,
                track: track.title,
                timestamp: track.timestamp,
                album: track.album,
                trackNumber: track.track_number,
                duration: track.duration
            });

            await db.markPlayScrobbled(track.id, track.timestamp);
        }
        catch(error) {
            console.error(error);
            console.error('scrobble error; will try again later');
        }
    }
}

function main() {
    const router = initRouter();
    startServer(router);

    if(!musicServerSettings.demoMode) {
        setInterval(checkScrobbleBacklog, 5 * 60 * 1000);
    }
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    if(err.code !== "ENOENT" &&
            err.code !== "ENOTFOUND" &&
            err.code !== "ETIMEDOUT" &&
            err.code !== "ECONNRESET" &&
            err.code !== "ECONNREFUSED" &&
            err.code !== "EAI_AGAIN") {
        throw err;
    }
});

main();
