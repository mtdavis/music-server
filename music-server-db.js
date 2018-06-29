const Promise = require("bluebird");
const sqlite3 = Promise.promisifyAll(require("sqlite3"));
const musicServerSettings = require("./music-server-settings.json");

class MusicServerDb {
    constructor() {
        this.db = new sqlite3.Database(musicServerSettings.files.db_path);
    }

    selectTrackByIdAsync(trackId) {
        const statement = this.db.prepare(
            "SELECT * FROM track_view WHERE id = $trackId");

        return statement.getAsync({
            $trackId: trackId
        });
    }

    selectTrackByPathAsync(relativePath) {
        const statement = this.db.prepare(
            "SELECT * FROM track_view WHERE path = $path");

        return statement.getAsync({
            $path: relativePath
        });
    }

    updateTrackFromMetadataAsync(track) {
        const currentTime = Math.floor(Date.now() / 1000);
        const statement = this.db.prepare(
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
    }

    addTrackFromMetadataAsync(track) {
        const currentTime = Math.floor(Date.now() / 1000);
        const statement = this.db.prepare(
            "INSERT INTO track (title, artist, album_artist, album, genre, duration, " +
            "                   track_number, year, path, play_count, row_modified) " +
            "VALUES ($title, $artist, $album_artist, $album, $genre, $duration, " +
            "        $track_number, $year, $path, 0, $current_time)"
        );

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
    }

    selectTrackByInfoAsync(track) {
        let sql =
            "SELECT * FROM track_view " +
            "WHERE title = $title AND artist = $artist AND album = $album";

        if(track.track_number === null) {
            sql += " AND track_number IS $track_number";
        }
        else {
            sql += " AND track_number = $track_number";
        }

        if(track.year === null) {
            sql += " AND year IS $year";
        }
        else {
            sql += " AND year = $year";
        }

        return this.db.prepare(sql).getAsync({
            $title: track.title,
            $artist: track.artist,
            $album: track.album,
            $track_number: track.track_number,
            $year: track.year
        });
    }

    updateTrackPathAsync(trackId, relativePath) {
        const currentTime = Math.floor(Date.now() / 1000);
        const statement = this.db.prepare(
            "UPDATE track " +
            "SET path = $path, row_modified = $current_time " +
            "WHERE rowid = $id");

        return statement.runAsync({
            $path: relativePath,
            $id: trackId,
            $current_time: currentTime
        });
    }

    addToScrobbleBacklog(track, timestamp) {
        const statement = this.db.prepare(
            "INSERT INTO scrobble_backlog (title, artist, album, track_number, duration, timestamp) " +
            "VALUES ($title, $artist, $album, $track_number, $duration, $timestamp)");

        return statement.runAsync({
            $title: track.title,
            $artist: track.artist,
            $album: track.album,
            $track_number: track.track_number,
            $duration: track.duration,
            $timestamp: timestamp
        });
    }

    peekScrobbleBacklog() {
        const statement = this.db.prepare(
            "SELECT * FROM scrobble_backlog WHERE timestamp = " +
            "   (SELECT MIN(timestamp) FROM scrobble_backlog)");

        return statement.getAsync();
    }

    popScrobbleBacklog() {
        const statement = this.db.prepare(
            "DELETE FROM scrobble_backlog WHERE timestamp = " +
            "   (SELECT MIN(timestamp) FROM scrobble_backlog)");

        return statement.runAsync();
    }

    async submitPlay(trackId, timestamp) {
        const statement = this.db.prepare(
            "UPDATE track SET " +
            "   play_count = play_count + 1, " +
            "   last_play = $timestamp, " +
            "   row_modified = $current_time " +
            "WHERE rowid = $id");

        const currentTime = Math.floor(Date.now() / 1000);

        await statement.runAsync({
            $id: trackId,
            $timestamp: timestamp,
            $current_time: currentTime
        });
    }

    async allIfModifiedSince(lastModifiedSql, selectSql, {
        ifModifiedSince, lastModifiedSqlParams, selectSqlParams
    }) {
        const db = this.db;

        const lastModifiedRow = await db.getAsync(lastModifiedSql, lastModifiedSqlParams);
        const lastModified = new Date(lastModifiedRow.last_modified * 1000);

        if(ifModifiedSince && ifModifiedSince.getTime() >= lastModified.getTime()) {
            return {notModified: true, lastModified};
        }

        const rows = await db.allAsync(selectSql, selectSqlParams);
        return {lastModified, rows};
    }
}

module.exports = {
    MusicServerDb: MusicServerDb
};


/*
DROP VIEW track_view;
CREATE VIEW track_view (
    id, title, artist, artist_id,
    album, album_id, genre, track_number, year,
    duration, path,
    last_play, play_count,
    owner, last_modified, release_date
) AS
    SELECT
        track.rowid, track.title, artist.name, track.artist_id,
        album.title, track.album_id, track.genre, track.track_number, track.year,
        track.duration, track.path, track.last_play, track.play_count,
        track.owner, track.row_modified,
        (CASE WHEN track.release_date IS NULL THEN
           CAST(strftime('%s', printf('%d-01-01', track.year)) AS INT) ELSE
           track.release_date END)
    FROM track
    LEFT JOIN album ON track.album_id=album.rowid
    LEFT JOIN artist ON track.artist_id=artist.rowid;

DROP VIEW album_view;
CREATE VIEW album_view (id, title, artist, genre, year, release_date, duration, tracks, last_play, play_count, last_modified) AS
SELECT album.rowid, album.title, artist.name, track.genre, track.year,
(CASE WHEN track.release_date IS NULL THEN
   CAST(strftime('%s', printf('%d-01-01', track.year)) AS INT) ELSE
   track.release_date END),
SUM(track.duration), COUNT(track.rowid),
(CASE WHEN COUNT(track.last_play) = COUNT(track.rowid) THEN min(track.last_play) ELSE NULL END),
MIN(track.play_count) AS play_count,
MAX(track.row_modified)
FROM track
LEFT JOIN album ON track.album_id=album.rowid
LEFT JOIN artist ON album.artist_id=artist.rowid
WHERE track.album_id IS NOT NULL
GROUP BY track.album_id;
*/
