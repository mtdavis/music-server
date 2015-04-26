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
        router.get("/albums", albumsHandler(db));
        router.get("/tracks", tracksHandler(db));
        router.post("/submit-play", submitPlayHandler(db, lastfm));
        router.post("/submit-now-playing", submitNowPlayingHandler(db, lastfm));
    });

    return result;
}

function albumsHandler(db)
{
    var statement = db.prepare(
        "SELECT MIN(rowid) AS id, album_artist, album, genre, SUM(duration) AS duration, " +
        "COUNT(track_number) AS tracks, year, " +
        "MIN(last_play) AS last_play, MIN(play_count) AS play_count " +
        "FROM track " +
        "WHERE album != '' " +
        "GROUP BY album_artist, album");

    return function(req, res, next)
    {
        console.log(req.url);

        statement.allAsync().then(function(rows)
        {
            res.statusCode = 200;
            res.end(JSON.stringify(rows));
        }).catch(function(error)
        {
            console.error(error)
            res.statusCode = 500;
            res.end();
        });
    };
}

function tracksHandler(db)
{
    var statement = db.prepare(
        "SELECT rowid AS id, * FROM track " +
        "WHERE album_artist LIKE $album_artist " +
        "AND album LIKE $album " +
        "ORDER BY album_artist, album, track_number");

    return function(req, res, next)
    {
        console.log(req.url);
        var query = url.parse(req.url, true)["query"];

        statement.allAsync({
            $album_artist: query.album_artist || "%",
            $album: query.album || "%"
        }).then(function(rows)
        {
            res.statusCode = 200;
            res.end(JSON.stringify(rows));
        }).catch(function(error)
        {
            console.error(error)
            res.statusCode = 500;
            res.end();
        });
    };
}

function selectTrackById(db, trackId)
{
    var statement = db.prepare(
        "SELECT * FROM track WHERE rowid = $trackId");

    return statement.getAsync({
        $trackId: trackId
    });
}

function doScrobble(lastfm, options)
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
            return selectTrackById(db, trackId);
        }).then(function(track)
        {
            return doScrobble(lastfm, {
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

        selectTrackById(db, trackId).then(function(track)
        {
            return doScrobble(lastfm, {
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
