var Promise = require("bluebird");
var sqlite3 = Promise.promisifyAll(require("sqlite3"));
var musicServerSettings = require("./music-server-settings.json");

var MusicServerDb = function()
{
    var db = new sqlite3.Database(musicServerSettings.files.db_path);

    db.selectTrackByIdAsync = function(trackId)
    {
        var statement = db.prepare(
            "SELECT * FROM track WHERE rowid = $trackId");

        return statement.getAsync({
            $trackId: trackId
        });
    };

    db.selectTrackByPathAsync = function(relativePath)
    {
        var statement = db.prepare(
            "SELECT rowid as id, * FROM track WHERE path = $path");

        return statement.getAsync({
            $path: relativePath
        });
    };

    db.updateTrackFromMetadataAsync = function(track)
    {
        var currentTime = Math.floor(Date.now() / 1000);
        var statement = db.prepare(
            "UPDATE track " +
            "SET title = $title, artist = $artist, album_artist = $album_artist, album = $album, " +
            "    genre = $genre, track_number = $track_number, year = $year, " +
            "    row_modified = $current_time " +
            "WHERE rowid = $id");

        return statement.runAsync({
            $title: track.title,
            $artist: track.artist,
            $album_artist: track.album_artist,
            $album: track.album,
            $genre: track.genre,
            $track_number: track.track_number,
            $year: track.year,
            $current_time: currentTime,
            $id: track.id
        });
    };

    db.addTrackFromMetadataAsync = function(track)
    {
        var currentTime = Math.floor(Date.now() / 1000);
        var statement = db.prepare(
            "INSERT INTO track (title, artist, album_artist, album, genre, duration, track_number, year, path, play_count, row_modified) " +
            "VALUES ($title, $artist, $album_artist, $album, $genre, $duration, $track_number, $year, $path, 0, $current_time)");

        return statement.runAsync({
            $title: track.title,
            $artist: track.artist,
            $album_artist: track.album_artist,
            $album: track.album,
            $genre: track.genre,
            $duration: track.duration,
            $track_number: track.track_number,
            $year: track.year,
            $path: track.path,
            $current_time: currentTime
        });
    };

    db.selectTrackByInfoAsync = function(track)
    {
        var sql =
            "SELECT rowid as id, * FROM track " +
            "WHERE title = $title AND artist = $artist AND album = $album";

        if(track.track_number === null)
        {
            sql += " AND track_number IS $track_number";
        }
        else
        {
            sql += " AND track_number = $track_number";
        }

        if(track.year === null)
        {
            sql += " AND year IS $year";
        }
        else
        {
            sql += " AND year = $year";
        }

        return db.prepare(sql).getAsync({
            $title: track.title,
            $artist: track.artist,
            $album: track.album,
            $track_number: track.track_number,
            $year: track.year
        });
    };

    db.updateTrackPathAsync = function(trackId, relativePath)
    {
        var currentTime = Math.floor(Date.now() / 1000);
        var statement = db.prepare(
            "UPDATE track " +
            "SET path = $path, row_modified = $current_time " +
            "WHERE rowid = $id");

        return statement.runAsync({
            $path: relativePath,
            $id: trackId,
            $current_time: currentTime
        });
    }

    //TODO: when refactoring is complete, should return this rather than db.
    return db;
};

module.exports = {
    MusicServerDb: MusicServerDb
}
