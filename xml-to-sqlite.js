var fs = require("fs")
var plist = require("plist");
var sqlite3 = require("sqlite3");

function createTable(db)
{
    db.run("CREATE TABLE IF NOT EXISTS track(" +
        "title TEXT NOT NULL, " +
        "artist TEXT NOT NULL, " +
        "album_artist TEXT NOT NULL, " +
        "album TEXT NOT NULL, " +
        "genre TEXT NOT NULL, " +
        "duration INTEGER NOT NULL, " +
        "track_number INTEGER, " +
        "year INTEGER, " +
        "last_play INTEGER, " +
        "play_count INTEGER NOT NULL, " +
        "path TEXT NOT NULL, " +
        "row_modified INTEGER" +
        ")");
}

function parseXml()
{
    console.log("Parsing XML...");
    var xmlLib = plist.parse(fs.readFileSync("lib.apple.xml", "UTF-8"));
    console.log("Done.");

    return xmlLib["Tracks"];
}

function insertTracks(db, tracks)
{
    console.log("Inserting tracks...");

    var statement = db.prepare("INSERT INTO track " +
        "(title, artist, album_artist, album, genre, duration, track_number, year, last_play, play_count, path, row_modified) " + 
        "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    var currentTime = Math.floor(new Date().getTime() / 1000);

    for(var key in tracks)
    {
        var track = tracks[key];

        var location = unescape(decodeURI(track["Location"])).
            replace(/\\/g, "/").replace(/file:\/\/localhost\/D:\/music\//, "");

        statement.run(track["Name"], 
            track["Artist"] || "",
            track["Album Artist"] || "",
            track["Album"] || "",
            track["Genre"] || "",
            track["Total Time"] / 1000,
            track["Track Number"],
            track["Year"],
            track["Play Date"],
            track["Play Count"] || 0,
            location,
            track["Play Date"] || currentTime);
    }

    statement.finalize();

    console.log("Done.");
}

var tracks = parseXml();

var db = new sqlite3.Database("db.sqlite");

db.serialize(function(){
    createTable(db);
    insertTracks(db, tracks);
});

db.close();
