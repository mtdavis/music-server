var Promise = require("bluebird");
var connect = require("connect");
var http = require("http");
var https = require("https");
var serveStatic = require("serve-static");
var connectRoute = require("connect-route");
var basicAuth = require("connect-basic-auth");
var url = require("url");
var bodyParser = require("body-parser");
var musicServerSettings = require("./music-server-settings.json");
var fs = Promise.promisifyAll(require("fs"));
var path = require("path");

var db = require("./music-server-db").MusicServerDb();
var lastfm = require("./music-server-lastfm").MusicServerLastfm();
var util = require("./music-server-util");
var scanner = require("./music-server-scanner");
var connectLimitBandwidth = require("./connect-limit-bandwidth");

function initRouter()
{
    var result = connectRoute(function(router)
    {
        router.get("/albums", albumsHandler());
        router.get("/tracks", tracksHandler());
        router.get("/album-art", albumArtHandler());
        router.get("/shuffle", shuffleHandler());
        router.post("/submit-play", submitPlayHandler());
        router.post("/submit-now-playing", submitNowPlayingHandler());
        router.post("/tools/scan-for-changed-metadata", scanForChangedMetadataHandler());
        router.post("/tools/scan-for-new-files", scanForNewFilesHandler());
        router.post("/tools/scan-for-moved-files", scanForMovedFilesHandler());
    });

    return result;
}

function selectFromDb(lastModifiedSql, selectSql, settings)
{
    return function(req, res, next)
    {
        console.log(req.url);

        var lastModifed;
        var ifModifiedSince = null;
        if(req.headers["if-modified-since"])
        {
            var ifModifiedSince = new Date(req.headers["if-modified-since"]);
        }

        var lastModifiedSqlParams = {};
        if(settings && settings.lastModifiedSqlParamsBuilder)
        {
            lastModifiedSqlParams = settings.lastModifiedSqlParamsBuilder(req);
        }

        db.getAsync(lastModifiedSql, lastModifiedSqlParams).then(function(row)
        {
            lastModified = new Date(row.last_modified * 1000);

            if(ifModifiedSince &&
                ifModifiedSince.getTime() === lastModified.getTime())
            {
                res.writeHead(304, {
                    "Last-Modified": lastModified.toUTCString()
                })
                res.end();
                return null;
            }
            else
            {
                var selectSqlParams = {}
                if(settings && settings.selectSqlParamsBuilder)
                {
                    selectSqlParams = settings.selectSqlParamsBuilder(req);
                }
                return db.allAsync(selectSql, selectSqlParams);
            }
        }).then(function(rows)
        {
            if(rows)
            {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Pragma": "Public",
                    "Last-Modified": lastModified.toUTCString()
                });
                res.write(JSON.stringify(rows));
                res.end();
            }
        }).catch(function(error)
        {
            console.error(error)
            res.statusCode = 500;
            res.end();
        });
    }
}

function albumsHandler()
{
    var lastModifiedSql = "SELECT MAX(row_modified) AS last_modified " +
        "FROM track " +
        "WHERE album != ''";

    var albumsSql = "SELECT MIN(rowid) AS id, album_artist, album, genre, SUM(duration) AS duration, " +
        "COUNT(rowid) AS tracks, year, " +
        "(CASE WHEN COUNT(last_play) = COUNT(rowid) THEN min(last_play) ELSE NULL END) AS last_play, " +
        "MIN(play_count) AS play_count " +
        "FROM track " +
        "WHERE album != '' " +
        "GROUP BY album_artist, album";

    return selectFromDb(lastModifiedSql, albumsSql);
}

function tracksHandler()
{
    var lastModifiedSql = "SELECT max(row_modified) AS last_modified " +
        "FROM track " +
        "WHERE album_artist LIKE $album_artist " +
        "AND album LIKE $album";

    var tracksSql = "SELECT rowid AS id, * FROM track " +
        "WHERE album_artist LIKE $album_artist " +
        "AND album LIKE $album " +
        "ORDER BY album_artist, album, track_number";

    var sqlParamsBuilder = function(req)
    {
        var query = url.parse(req.url, true)["query"];

        return {
            $album_artist: query.album_artist || "%",
            $album: query.album || "%"
        };
    };

    return selectFromDb(lastModifiedSql, tracksSql, {
        lastModifiedSqlParamsBuilder: sqlParamsBuilder,
        selectSqlParamsBuilder: sqlParamsBuilder
    });
}

function shuffleHandler()
{
    var lastModifiedSql = "SELECT MAX(strftime('%s', 'now')) AS last_modified";

    var shuffleSql = "SELECT rowid AS id, * FROM track " +
        "WHERE (play_count >= 5) AND (duration >= 50) AND (duration < 1000) " +
        "AND (last_play < strftime('%s', 'now') - 180*24*60*60) " +
        "ORDER BY RANDOM() " +
        "LIMIT 100";

    return selectFromDb(lastModifiedSql, shuffleSql);
}

function albumArtHandler()
{
    return function(req, res, next)
    {
        console.log(req.url);
        var query = url.parse(req.url, true)["query"];
        var trackId = query.id;

        var ifModifiedSince = null;
        if(req.headers["if-modified-since"])
        {
            var ifModifiedSince = new Date(req.headers["if-modified-since"]);
        }

        var relativeExpectedArtPathJpg;
        var relativeExpectedArtPathPng;

        db.selectTrackByIdAsync(trackId).then(function(track)
        {
            //find path to mp3
            var relativeTrackPath = track.path;
            var relativeTrackDirectory = path.dirname(relativeTrackPath);
            relativeExpectedArtPathJpg = path.join(relativeTrackDirectory,
                util.escapeForFileSystem(track.album) + ".jpg");
            relativeExpectedArtPathPng = path.join(relativeTrackDirectory,
                util.escapeForFileSystem(track.album) + ".png");

            var fullTrackPath = path.join(musicServerSettings.files.base_stream_path, relativeTrackPath);

            return Promise.join(
                fs.statAsync(fullTrackPath),
                util.fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathJpg)),
                util.fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathPng)),
                util.getMetadataAsync(fullTrackPath));
        }).spread(function(mp3Stat, jpgExists, pngExists, metadata)
        {
            //if file exists... forward to the static address
            //it will handle caching info
            if(jpgExists)
            {
                res.writeHead(303, {
                    "Location":"/stream/" + relativeExpectedArtPathJpg.replace(/\\/g, "/")
                });
                res.end();
            }
            else if(pngExists)
            {
                res.writeHead(303, {
                    "Location":"/stream/" + relativeExpectedArtPathPng.replace(/\\/g, "/")
                });
                res.end();
            }
            else if(metadata.picture && metadata.picture.length > 0)
            {
                var contentType;

                if(metadata.picture[0].format === "jpg")
                {
                    contentType = "image/JPEG";
                }
                else
                {
                    //don't send a content type; maybe the browser can figure it out
                    console.log("Unexpected album art format: " + metadata.picture[0].format);
                }

                if(ifModifiedSince &&
                    ifModifiedSince.getTime() === mp3Stat.mtime.getTime())
                {
                    res.writeHead(304, {
                        "Last-Modified": mp3Stat.mtime.toUTCString()
                    });
                    res.end();
                }
                else
                {
                    res.writeHead(200, {
                        "Content-Type": contentType,
                        "Pragma": "Public",
                        "Last-Modified": mp3Stat.mtime.toUTCString()
                    });
                    res.end(metadata.picture[0].data);
                }
            }
            else
            {
                res.statusCode = 404;
                res.end();
            }
        }).catch(function(error)
        {
            console.trace(error);
            res.statusCode = 500;
            res.end();
        });
    };
}

function submitPlayHandler()
{
    var statement = db.prepare(
        "UPDATE track SET play_count = play_count + 1, last_play = $last_play, row_modified = $current_time " +
        "WHERE rowid = $id");

    return function(req, res, next)
    {
        console.log(req.url, req.body);
        var trackId = req.body.id;

        var currentTime = Math.floor(Date.now() / 1000);
        var lastPlay = req.body.started_playing || currentTime;

        statement.runAsync({
            $id: trackId,
            $last_play: lastPlay,
            $current_time: currentTime
        }).then(function()
        {
            return db.selectTrackByIdAsync(trackId);
        }).then(function(track)
        {
            return lastfm.doScrobbleAsync({
                method: 'track.scrobble',
                artist: track.artist,
                track: track.title,
                timestamp: lastPlay,
                album: track.album,
                trackNumber: track.track_number,
                duration: track.duration
            });
        }).then(function()
        {
            res.statusCode = 200;
            res.end();
        }).catch(function(error)
        {
            console.error(error)
            res.statusCode = 500;
            res.end();
        });
    }
}

function submitNowPlayingHandler()
{
    var statement = db.prepare(
        "SELECT * FROM track WHERE rowid = $id");

    return function(req, res, next)
    {
        console.log(req.url, req.body);
        var trackId = req.body.id;

        db.selectTrackByIdAsync(trackId).then(function(track)
        {
            return lastfm.doScrobbleAsync({
                method: 'track.updateNowPlaying',
                artist: track.artist,
                track: track.title,
                album: track.album,
                trackNumber: track.track_number,
                duration: track.duration
            });
        }).then(function()
        {
            res.statusCode = 200;
            res.end();
        }).catch(function(error)
        {
            console.error(error)
            res.statusCode = 500;
            res.end();
        });
    }
}

function scanForChangedMetadataHandler()
{
    return scanHandler(scanner.scanForChangedMetadataAsync);
}

function scanForMovedFilesHandler()
{
    return scanHandler(scanner.scanForMovedFilesAsync);
}

function scanForNewFilesHandler()
{
    return scanHandler(scanner.scanForNewFilesAsync);
}


function scanHandler(scanFunction)
{
    return function(req, res, next)
    {
        console.log(req.url);

        scanFunction().then(function()
        {
            res.statusCode = 200;
            res.end();
        }).catch(function(error)
        {
            console.error(error);
            res.statusCode = 500;
            res.end();
        });
    };
}

function startServer(router)
{
    var app = connect();

    app.use(basicAuth(function(credentials, req, res, next)
    {
        var authenticated = false;
        for(var i = 0; i < musicServerSettings.users.length; i++)
        {
            if(musicServerSettings.users[i].username === credentials.username &&
                musicServerSettings.users[i].password === credentials.password)
            {
                authenticated = true;
                next();
            }
        }

        if(!authenticated)
        {
            next(new Error("Not authorized"));
        }
    }));

    app.use(function(req, res, next) {
        req.requireAuthorization(req, res, next);
    });

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(connectLimitBandwidth(musicServerSettings.throttleRate));

    app.use("/stream", serveStatic(musicServerSettings.files.base_stream_path));
    app.use("/", serveStatic("./client/build"));
    app.use(router);

    app.use(function(req, res, next)
    {
        res.statusCode = 404;
        res.end("404");
    });

    var options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };

    https.createServer(options, app).listen(443);

    var httpApp = connect();
    httpApp.use("/", function(req, res, next)
    {
        res.writeHead(303, {
            "Location":"https://" + req.headers.host
        });
        res.end();
    });

    http.createServer(httpApp).listen(80);
}

function main()
{
    var router = initRouter();
    startServer(router);
}

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  if(err.code !== "ENOENT")
  {
    throw err;
  }
});

main();
