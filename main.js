var Promise = require("bluebird");
var connect = require("connect");
var http = require("http");
var serveStatic = require("serve-static");
var sqlite3 = Promise.promisifyAll(require("sqlite3"));
var connectRoute = require("connect-route");
var url = require("url");
var bodyParser = require("body-parser");
var SimpleLastfm = require("simple-lastfm");
var musicServerSettings = require("./music-server-settings.json");
var fs = Promise.promisifyAll(require("fs"));
var path = require("path");
var musicmetadata = require("musicmetadata");

function initDatabase()
{
    return new sqlite3.Database(musicServerSettings.files.db_path);
}

function initLastfm()
{
    var result = new SimpleLastfm(musicServerSettings.lastfm);

    if(musicServerSettings.lastfm.session_key === null)
    {
        var callback = function(result)
        {
            if(result.success)
            {
                console.log("got last.fm session key: " + result.session_key);
            }
            else
            {
                console.error("could not get last.fm session key");
            }
        };

        result.getSessionKey(callback);
    }

    return result;
}

function initRouter(db, lastfm)
{
    var result = connectRoute(function(router)
    {
        router.get("/albums/not-recently-played", albumsNotRecentlyPlayedHandler(db));
        router.get("/albums", albumsHandler(db));
        router.get("/tracks", tracksHandler(db));
        router.get("/album-art", albumArtHandler(db));
        router.post("/submit-play", submitPlayHandler(db, lastfm));
        router.post("/submit-now-playing", submitNowPlayingHandler(db, lastfm));
    });

    return result;
}

function selectFromDb(db, lastModifiedSql, selectSql, settings)
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
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Pragma": "Public",
                "Last-Modified": lastModified.toUTCString()
            });
            res.end(JSON.stringify(rows));
        }).catch(function(error)
        {
            console.error(error)
            res.statusCode = 500;
            res.end();
        });
    }
}

function albumsNotRecentlyPlayedHandler(db)
{
    var lastModifiedSql = "SELECT MAX(row_modified) AS last_modified " +
        "FROM track " +
        "WHERE album != ''";

    var albumsSql =
        "SELECT * FROM (" +
        "    SELECT MIN(rowid) AS id, album_artist, album, genre, SUM(duration) AS duration, " +
        "    COUNT(track_number) AS tracks, year, " +
        "    (CASE WHEN COUNT(last_play) = COUNT(*) THEN min(last_play) ELSE NULL END) AS last_play, " +
        "    MIN(play_count) AS play_count " +
        "    FROM track " +
        "    WHERE album != '' " +
        "    GROUP BY album_artist, album) " +
        "WHERE last_play IS NULL OR last_play < $before_timestamp " +
        "ORDER BY last_play DESC";

    var selectSqlParamsBuilder = function(req)
    {
        var query = url.parse(req.url, true)["query"];
        var daysAgo = query.daysAgo || 42; //default == 6 weeks
        var secondsAgo = daysAgo * 24 * 60 * 60;
        var beforeTimestamp = Math.floor(new Date().getTime() / 1000) - secondsAgo;

        return {
            $before_timestamp: beforeTimestamp
        };
    };

    return selectFromDb(db, lastModifiedSql, albumsSql, {
        selectSqlParamsBuilder: selectSqlParamsBuilder
    });
}

function albumsHandler(db)
{
    var lastModifiedSql = "SELECT MAX(row_modified) AS last_modified " +
        "FROM track " +
        "WHERE album != ''";

    var albumsSql = "SELECT MIN(rowid) AS id, album_artist, album, genre, SUM(duration) AS duration, " +
        "COUNT(track_number) AS tracks, year, " +
        "MIN(last_play) AS last_play, MIN(play_count) AS play_count " +
        "FROM track " +
        "WHERE album != '' " +
        "GROUP BY album_artist, album";

    return selectFromDb(db, lastModifiedSql, albumsSql);
}

function tracksHandler(db)
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

    return selectFromDb(db, lastModifiedSql, tracksSql, {
        lastModifiedSqlParamsBuilder: sqlParamsBuilder,
        selectSqlParamsBuilder: sqlParamsBuilder
    });
}

function albumArtHandler(db)
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

        selectTrackByIdAsync(db, trackId).then(function(track)
        {
            //find path to mp3
            var relativeTrackPath = track.path;
            var relativeTrackDirectory = path.dirname(relativeTrackPath);
            relativeExpectedArtPathJpg = path.join(relativeTrackDirectory, track.album + ".jpg");
            relativeExpectedArtPathPng = path.join(relativeTrackDirectory, track.album + ".png");

            var fullTrackPath = path.join(musicServerSettings.files.base_stream_path, relativeTrackPath);

            return Promise.join(
                fs.statAsync(fullTrackPath),
                fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathJpg)),
                fileExistsAsync(path.join(musicServerSettings.files.base_stream_path, relativeExpectedArtPathPng)),
                getMetadataAsync(fullTrackPath));
        }).spread(function(mp3Stat, jpgExists, pngExists, metadata)
        {
            //if file exists... forward to the static address
            //it will handle caching info
            if(jpgExists)
            {
                res.writeHead(303, {
                    "Location":"/stream/" + relativeExpectedArtPathJpg
                });
                res.end();
            }
            else if(pngExists)
            {
                res.writeHead(303, {
                    "Location":"/stream/" + relativeExpectedArtPathPng
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

function fileExistsAsync(filePath)
{
    return new Promise(function(resolve, reject)
    {
        fs.statAsync(filePath).then(function(stat)
        {
            resolve(true);
        }).catch(function(error)
        {
            if(error.code === "ENOENT")
            {
                resolve(false);
            }
            else
            {
                reject(error);
            }
        });
    });
}

function selectTrackByIdAsync(db, trackId)
{
    var statement = db.prepare(
        "SELECT * FROM track WHERE rowid = $trackId");

    return statement.getAsync({
        $trackId: trackId
    });
}

function doScrobbleAsync(lastfm, options)
{
    return new Promise(function(resolve, reject)
    {
        options.callback = function(result)
        {
            if(result.success)
            {
                resolve(result);
            }
            else
            {
                reject(result.error);
            }
        };

        lastfm.doScrobble(options);
    });
}

function getMetadataAsync(trackPath)
{
    return new Promise(function(resolve, reject)
    {
        musicmetadata(fs.createReadStream(trackPath), {}, function(err, metadata)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(metadata);
            }
        });
    });
}

function submitPlayHandler(db, lastfm)
{
    var statement = db.prepare(
        "UPDATE track SET play_count = play_count + 1, last_play = $started_playing " +
        "WHERE rowid = $id");

    return function(req, res, next)
    {
        console.log(req.url, req.body);
        var trackId = req.body.id;

        //TODO: correct for duration
        var startedPlaying = req.body.started_playing || Math.floor(Date.now() / 1000);

        statement.runAsync({
            $id: trackId,
            $started_playing: startedPlaying
        }).then(function()
        {
            return selectTrackByIdAsync(db, trackId);
        }).then(function(track)
        {
            return doScrobbleAsync(lastfm, {
                method: 'track.scrobble',
                artist: track.artist,
                track: track.title,
                timestamp: startedPlaying,
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

function submitNowPlayingHandler(db, lastfm)
{
    var statement = db.prepare(
        "SELECT * FROM track WHERE rowid = $id");

    return function(req, res, next)
    {
        console.log(req.url, req.body);
        var trackId = req.body.id;

        selectTrackByIdAsync(db, trackId).then(function(track)
        {
            return doScrobbleAsync(lastfm, {
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

function startServer(db, router)
{
    var app = connect();
    app.use("/stream", serveStatic(musicServerSettings.files.base_stream_path));
    app.use("/", serveStatic("./client/build"));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(router);
    http.createServer(app).listen(80);
}

function main()
{
    var db = initDatabase();
    var lastfm = initLastfm();
    var router = initRouter(db, lastfm);
    startServer(db, router);
}

main();
