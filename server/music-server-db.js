const Promise = require("bluebird");
const sqlite3 = Promise.promisifyAll(require("sqlite3"));
const musicServerSettings = require("../music-server-settings.json");

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

    async getArtistId(name) {
        const statement = this.db.prepare("SELECT id FROM artist WHERE name = $name");
        let artistIdRow = await statement.getAsync({$name: name});

        if(!artistIdRow) {
            const insert = this.db.prepare("INSERT INTO artist (name) VALUES ($name)");
            await insert.runAsync({$name: name});
            artistIdRow = await statement.getAsync({$name: name});
        }

        return artistIdRow.id;
    }

    async getAlbumId(title, albumArtistName) {
        if(!title) {
            return null;
        }

        const albumArtistId = await this.getArtistId(albumArtistName);

        const statement = this.db.prepare(
            "SELECT id FROM album WHERE title = $title AND artist_id = $artist_id");
        let albumIdRow = await statement.getAsync({$title: title, $artist_id: albumArtistId});

        if(!albumIdRow) {
            const insert = this.db.prepare(
                "INSERT INTO album (title, artist_id) VALUES ($title, $artist_id)");
            await insert.runAsync({$title: title, $artist_id: albumArtistId});
            albumIdRow = await statement.getAsync({$title: title, $artist_id: albumArtistId});
        }

        return albumIdRow.id;
    }

    async updateTrackFromMetadataAsync(track) {
        const artistId = await this.getArtistId(track.artist);
        const albumId = await this.getAlbumId(track.album, track.album_artist);

        const currentTime = Math.floor(Date.now() / 1000);
        const statement = this.db.prepare(
            "UPDATE track " +
            "SET title = $title, artist_id = $artist_id, album_id = $album_id, " +
            "    genre = $genre, track_number = $track_number, year = $year, " +
            "    row_modified = $current_time " +
            "WHERE id = $id");

        return statement.runAsync({
            $title: track.title,
            $artist_id: artistId,
            $album_id: albumId,
            $genre: track.genre,
            $track_number: track.track_number,
            $year: track.year,
            $current_time: currentTime,
            $id: track.id
        });
    }

    async addTrackFromMetadataAsync(track) {
        const artistId = await this.getArtistId(track.artist);
        const albumId = await this.getAlbumId(track.album, track.album_artist);

        const currentTime = Math.floor(Date.now() / 1000);
        const statement = this.db.prepare(
            "INSERT INTO track (title, artist_id, album_id, genre, duration, " +
            "                   track_number, year, path, row_modified) " +
            "VALUES ($title, $artist_id, $album_id, $genre, $duration, " +
            "        $track_number, $year, $path, $current_time)"
        );

        return statement.runAsync({
            $title: track.title,
            $artist_id: artistId,
            $album_id: albumId,
            $genre: track.genre,
            $duration: track.duration,
            $track_number: track.track_number,
            $year: track.year,
            $path: track.path,
            $current_time: currentTime
        });
    }

    async selectTrackByInfoAsync(track) {
        const artistId = await this.getArtistId(track.artist);
        const albumId = await this.getAlbumId(track.album, track.album_artist);

        let sql =
            "SELECT * FROM track_view " +
            "WHERE title = $title AND artist_id = $artist_id AND album_id = $album_id";

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
            $artist_id: artistId,
            $album_id: albumId,
            $track_number: track.track_number,
            $year: track.year
        });
    }

    updateTrackPathAsync(trackId, relativePath) {
        const currentTime = Math.floor(Date.now() / 1000);
        const statement = this.db.prepare(
            "UPDATE track " +
            "SET path = $path, row_modified = $current_time " +
            "WHERE id = $id");

        return statement.runAsync({
            $path: relativePath,
            $id: trackId,
            $current_time: currentTime
        });
    }

    getTrackFromScrobbleBacklog() {
        const statement = this.db.prepare(
            "SELECT track_view.id, track_view.artist, track_view.title, track_view.album, " +
            "   track_view.track_number, track_view.duration, play.timestamp " +
            "FROM play LEFT JOIN track_view ON play.track_id=track_view.id " +
            "WHERE play.timestamp IS NOT NULL AND play.scrobbled=0 " +
            "   AND play.timestamp < strftime('%s', 'now') - 300 " +
            "LIMIT 1"
        );

        return statement.getAsync();
    }

    async submitPlay(trackId, timestamp, scrobbled) {
        const statement = this.db.prepare(
            "UPDATE track SET " +
            "   row_modified = $current_time " +
            "WHERE id = $id");

        const currentTime = Math.floor(Date.now() / 1000);

        await statement.runAsync({
            $current_time: currentTime
        });

        const insert = this.db.prepare(
            "INSERT INTO play (track_id, timestamp, scrobbled) " +
            "VALUES ($track_id, $timestamp, $scrobbled)");
        await insert.runAsync({
            $track_id: trackId,
            $timestamp: timestamp,
            $scrobbled: scrobbled
        });
    }

    async markPlayScrobbled(trackId, timestamp) {
        const statement = this.db.prepare(
            "UPDATE play SET scrobbled = 1 " +
            "WHERE track_id = $track_id AND timestamp = $timestamp"
        );

        await statement.runAsync({
            $track_id: trackId,
            $timestamp: timestamp,
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
    duration, path, owner, last_modified,
    last_play, play_count,
    release_date
) AS
    SELECT
        track.id, track.title, artist.name, track.artist_id,
        album.title, track.album_id, track.genre, track.track_number, track.year,
        track.duration, track.path, track.owner, track.row_modified,
        MAX(play.timestamp), COUNT(play.rowid),
        (CASE WHEN track.release_date IS NULL THEN
           CAST(strftime('%s', printf('%d-01-01', track.year)) AS INT) ELSE
           track.release_date END)
    FROM track
    LEFT JOIN play ON play.track_id=track.id
    LEFT JOIN album ON track.album_id=album.id
    LEFT JOIN artist ON track.artist_id=artist.id
    GROUP BY track.id;

DROP VIEW album_view;
CREATE VIEW album_view (
    id, title, artist, genre, year,
    release_date,
    duration, tracks,
    last_play,
    play_count, last_modified
) AS
    SELECT album.id, album.title, artist.name, track_view.genre, track_view.year,
    (CASE WHEN track_view.release_date IS NULL THEN
       CAST(strftime('%s', printf('%d-01-01', track_view.year)) AS INT) ELSE
       track_view.release_date END),
    SUM(track_view.duration), COUNT(track_view.id),
    (CASE WHEN COUNT(track_view.last_play) = COUNT(track_view.id) THEN min(track_view.last_play) ELSE NULL END),
    MIN(track_view.play_count) AS play_count, MAX(track_view.last_modified)
    FROM track_view
    LEFT JOIN album ON track_view.album_id=album.id
    LEFT JOIN artist ON album.artist_id=artist.id
    WHERE track_view.album_id IS NOT NULL
    GROUP BY track_view.album_id;

DROP VIEW playlist_view;
CREATE VIEW playlist_view (
    id, title,
    duration, tracks,
    last_play, play_count, last_modified
) AS
SELECT playlist.id AS id, playlist.title AS title,
SUM(track_view.duration) AS duration,
COUNT(playlist_track.rowid) AS tracks,
(
   CASE WHEN COUNT(track_view.last_play) = COUNT(track_view.id)
   THEN min(track_view.last_play)
   ELSE NULL END
) AS last_play,
MIN(track_view.play_count) AS play_count,
MAX(track_view.last_modified) AS last_modified
FROM playlist_track
LEFT JOIN playlist ON playlist.id = playlist_track.playlist_id
LEFT JOIN track_view ON playlist_track.track_id = track_view.id
GROUP BY playlist_track.playlist_id;
*/
