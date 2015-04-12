var connect = require("connect");
var http = require("http");
var serveStatic = require("serve-static");
var sqlite3 = require("sqlite3");
var connectRoute = require("connect-route");
var url = require("url");

function initDatabase()
{
    return new sqlite3.Database("db.sqlite");
}

function initRouter(db)
{
    var result = connectRoute(function(router)
    {
        router.get("/albums", albumsHandler(db));
        router.get("/tracks", tracksHandler(db));
    });

    /*router.addRoute("/tracks", function(req, res, match)
    {
        listTracks(db, req, res, match);
    });*/

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
        statement.all(function(err, rows)
        {
            if(err)
            {
                throw err;
            }

            res.statusCode = 200;
            res.end(JSON.stringify(rows));
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
        var query = url.parse(req.url, true)["query"];

        statement.all({
            $album_artist: query.album_artist || "%",
            $album: query.album || "%"
        }, function(err, rows)
        {
            if(err)
            {
                throw err;
            }

            res.statusCode = 200;
            res.end(JSON.stringify(rows));
        });
    };
}

function startServer(db, router)
{
    var app = connect();
    app.use("/stream", serveStatic("D:/music/"));
    app.use("/", serveStatic("./client/build"));
    app.use(router);
    http.createServer(app).listen(80);
}

function main()
{
    var db = initDatabase();
    var router = initRouter(db);
    startServer(db, router);
}

main();
