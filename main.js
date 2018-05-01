const Promise = require("bluebird");
const connect = require("connect");
const compression = require("compression");
const http = require("http");
const https = require("https");
const serveStatic = require("serve-static");
const connectRoute = require("connect-route");
const basicAuth = require("connect-basic-auth");
const url = require("url");
const bodyParser = require("body-parser");
const musicServerSettings = require("./music-server-settings.json");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");
const lyricist = Promise.promisifyAll(require("lyricist")(musicServerSettings.genius.access_token));
const domain = require("domain");

const db = require("./music-server-db").MusicServerDb();
const lastfm = require("./music-server-lastfm").MusicServerLastfm();
const util = require("./music-server-util");
const scanner = require("./music-server-scanner");
const connectLimitBandwidth = require("./connect-limit-bandwidth");

function initRouter() {
    const result = connectRoute(function(router) {
        router.get("/albums", albumsHandler());
        router.get("/tracks", tracksHandler());
        router.get("/album-art", albumArtHandler());
        router.get("/shuffle", shuffleHandler());
        router.get("/lyrics", lyricsHandler());
        router.post("/submit-play", submitPlayHandler());
        router.post("/submit-now-playing", submitNowPlayingHandler());
        router.post("/tools/scan-for-changed-metadata", scanForChangedMetadataHandler());
        router.post("/tools/scan-for-new-files", scanForNewFilesHandler());
        router.post("/tools/scan-for-moved-files", scanForMovedFilesHandler());
    });

    return result;
}

function selectFromDb(lastModifiedSql, selectSql, settings) {
    return function(req, res, next) {
        console.log(req.url);

        let lastModified;
        let ifModifiedSince = null;
        if(req.headers["if-modified-since"]) {
            ifModifiedSince = new Date(req.headers["if-modified-since"]);
        }

        let lastModifiedSqlParams = {};
        if(settings && settings.lastModifiedSqlParamsBuilder) {
            lastModifiedSqlParams = settings.lastModifiedSqlParamsBuilder(req);
        }

        db.getAsync(lastModifiedSql, lastModifiedSqlParams).then(function(row) {
            lastModified = new Date(row.last_modified * 1000);

            if(ifModifiedSince &&
                ifModifiedSince.getTime() === lastModified.getTime()) {
                res.writeHead(304, {
                    "Last-Modified": lastModified.toUTCString()
                });
                res.end();
                return null;
            }
            else {
                let selectSqlParams = {};
                if(settings && settings.selectSqlParamsBuilder) {
                    selectSqlParams = settings.selectSqlParamsBuilder(req);
                }
                return db.allAsync(selectSql, selectSqlParams);
            }
        }).then(function(rows) {
            if(rows) {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Pragma": "Public",
                    "Last-Modified": lastModified.toUTCString()
                });
                res.write(JSON.stringify(rows));
                res.end();
            }
        }).catch(function(error) {
            console.error(error);
            res.statusCode = 500;
            res.end();
        });
    };
}

function albumsHandler() {
    const lastModifiedSql = "SELECT MAX(row_modified) AS last_modified " +
        "FROM track " +
        "WHERE album != ''";

    const albumsSql = "SELECT MIN(rowid) AS id, album_artist, album, genre, SUM(duration) AS duration, " +
        "COUNT(rowid) AS tracks, year, " +
        "(CASE WHEN COUNT(last_play) = COUNT(rowid) THEN min(last_play) ELSE NULL END) AS last_play, " +
        "MIN(play_count) AS play_count " +
        "FROM track " +
        "WHERE album != '' " +
        "GROUP BY album_artist, album";

    return selectFromDb(lastModifiedSql, albumsSql);
}

function tracksHandler() {
    const lastModifiedSql = "SELECT max(row_modified) AS last_modified " +
        "FROM track " +
        "WHERE album_artist LIKE $album_artist " +
        "AND album LIKE $album";

    const tracksSql = "SELECT rowid AS id, * FROM track " +
        "WHERE album_artist LIKE $album_artist " +
        "AND album LIKE $album " +
        "ORDER BY album_artist, album, track_number";

    function sqlParamsBuilder(req) {
        const query = url.parse(req.url, true).query;

        return {
            $album_artist: query.album_artist || "%",
            $album: query.album || "%"
        };
    }

    return selectFromDb(lastModifiedSql, tracksSql, {
        lastModifiedSqlParamsBuilder: sqlParamsBuilder,
        selectSqlParamsBuilder: sqlParamsBuilder
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
                    "Content-Type": 'text/plain'
                });
                res.end(song.lyrics.trim());
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

    const shuffleSql = "SELECT rowid AS id, * FROM track " +
        "WHERE (play_count >= 5) AND (duration >= 50) AND (duration < 1000) " +
        "AND (last_play < strftime('%s', 'now') - 90*24*60*60) " +
        "AND (album = '' OR album NOT IN (" +
        "    SELECT album FROM (" +
        "        SELECT album, MIN(play_count) AS play_count " +
        "        FROM track " +
        "        GROUP BY album_artist, album" +
        "    ) WHERE play_count >= 5 " +
        ")) " +
        "ORDER BY last_play";

    return selectFromDb(lastModifiedSql, shuffleSql);
}

function albumArtHandler() {
    return function(req, res, next) {
        console.log(req.url);
        const query = url.parse(req.url, true).query;
        const trackId = query.id;

        let ifModifiedSince = null;
        if(req.headers["if-modified-since"]) {
            ifModifiedSince = new Date(req.headers["if-modified-since"]);
        }

        let relativeExpectedArtPathJpg;
        let relativeExpectedArtPathPng;

        db.selectTrackByIdAsync(trackId).then(function(track) {
            // find path to mp3
            const relativeTrackPath = track.path;
            const relativeTrackDirectory = path.dirname(relativeTrackPath);
            relativeExpectedArtPathJpg = path.join(relativeTrackDirectory,
                util.escapeForFileSystem(track.album) + ".jpg");
            relativeExpectedArtPathPng = path.join(relativeTrackDirectory,
                util.escapeForFileSystem(track.album) + ".png");

            const fullTrackPath = path.join(musicServerSettings.files.base_stream_path, relativeTrackPath);

            return Promise.join(
                fs.statAsync(fullTrackPath),
                util.fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathJpg)),
                util.fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathPng)),
                util.getMetadataAsync(fullTrackPath));
        }).spread(function(mp3Stat, jpgExists, pngExists, metadata) {
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
        }).catch(function(error) {
            console.trace(error);
            res.statusCode = 500;
            res.end();
        });
    };
}

function submitPlayHandler() {
    const statement = db.prepare(
        "UPDATE track SET play_count = play_count + 1, last_play = $last_play, row_modified = $current_time " +
        "WHERE rowid = $id");

    return function(req, res, next) {
        console.log(req.url, req.body);
        const trackId = req.body.id;

        const currentTime = Math.floor(Date.now() / 1000);
        const lastPlay = req.body.started_playing || currentTime;

        function scrobbleOrQueue(track) {
            return lastfm.doScrobbleAsync({
                method: 'track.scrobble',
                artist: track.artist,
                track: track.title,
                timestamp: lastPlay,
                album: track.album,
                trackNumber: track.track_number,
                duration: track.duration
            }).catch(function(error) {
                return db.addToScrobbleBacklog(track, lastPlay).throw(error);
            });
        }

        statement.runAsync({
            $id: trackId,
            $last_play: lastPlay,
            $current_time: currentTime
        }).then(function() {
            return db.selectTrackByIdAsync(trackId);
        }).then(scrobbleOrQueue).then(function() {
            res.statusCode = 200;
            res.end();
        }).catch(function(error) {
            console.error(error);
            res.statusCode = 500;
            res.end();
        });
    };
}

function submitNowPlayingHandler() {
    const statement = db.prepare(
        "SELECT * FROM track WHERE rowid = $id");

    return function(req, res, next) {
        console.log(req.url, req.body);
        const trackId = req.body.id;

        db.selectTrackByIdAsync(trackId).then(function(track) {
            return lastfm.doScrobbleAsync({
                method: 'track.updateNowPlaying',
                artist: track.artist,
                track: track.title,
                album: track.album,
                trackNumber: track.track_number,
                duration: track.duration
            });
        }).then(function() {
            res.statusCode = 200;
            res.end();
        }).catch(function(error) {
            console.error(error);
            res.statusCode = 500;
            res.end();
        });
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
    app.use("/", serveStatic("./client/build"));
    app.use(router);

    app.use(function(req, res, next) {
        res.statusCode = 404;
        res.end("404");
    });

    const options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };

    https.createServer(options, app).listen(443);

    const httpApp = connect();
    httpApp.use("/", function(req, res, next) {
        res.writeHead(303, {
            "Location":"https://" + req.headers.host
        });
        res.end();
    });

    http.createServer(httpApp).listen(80);
}

function checkScrobbleBacklog() {
    function scrobbleAndPop(row) {
        if(row) {
            return lastfm.doScrobbleAsync({
                method: 'track.scrobble',
                artist: row.artist,
                track: row.title,
                timestamp: row.timestamp,
                album: row.album,
                trackNumber: row.track_number,
                duration: row.duration
            }).then(db.popScrobbleBacklog);
        }
        else {
            return util.dummyPromise();
        }
    }

    db.peekScrobbleBacklog().then(scrobbleAndPop).catch(function(error) {
        console.log(error);
    });
}

function main() {
    const router = initRouter();
    startServer(router);

    setInterval(checkScrobbleBacklog, 5 * 60 * 1000);
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    if(err.code !== "ENOENT" &&
            err.code !== "ENOTFOUND" &&
            err.code !== "ETIMEDOUT" &&
            err.code !== "ECONNRESET" &&
            err.code !== "EAI_AGAIN") {
        throw err;
    }
});

main();
