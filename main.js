var connect = require("connect");
var http = require("http");
var serveStatic = require("serve-static");
var sqlite3 = require("sqlite3");
var connectRoute = require("connect-route");

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
    return function(req, res, next)
    {
        db.all("SELECT album_artist, album, genre, SUM(duration) AS duration, " +
            "COUNT(track_number) AS tracks, year, " +
            "MIN(last_play) AS last_play, MIN(play_count) AS play_count " +
            "FROM track WHERE album != '' GROUP BY album_artist, album", function(err, rows)
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
    return function(req, res, next)
    {
        db.all("SELECT * FROM track", function(err, rows)
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
