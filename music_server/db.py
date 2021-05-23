from typing import List, Optional

from flask import Blueprint, g, current_app
import sqlite3

from .util import get_config


class Database:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

    def execute(self, query: str, **kwargs) -> List[sqlite3.Row]:
        self.cursor.execute(query, kwargs)
        return self.cursor.fetchall()

    def get_last_modified(self) -> int:
        return self.execute("""
            SELECT max(last_modified) as last_modified
            FROM track_view
        """)[0]['last_modified']

    def get_albums(self) -> List[sqlite3.Row]:
        return self.execute("""
            SELECT
                id,
                artist AS album_artist,
                title AS album,
                genre,
                duration,
                tracks,
                year,
                release_date,
                last_play,
                play_count
            FROM album_view
        """)

    def get_tracks(
        self,
        track_id: Optional[int] = None,
        album_id: Optional[int] = None
    ) -> List[sqlite3.Row]:
        return self.execute("""
            SELECT
                id,
                title,
                artist,
                album_artist,
                album,
                album_id,
                genre,
                track_number,
                release_date,
                duration,
                path,
                last_play,
                play_count,
                last_modified,
                year
            FROM track_view
            WHERE (
                (id=$track_id OR $track_id IS NULL) AND
                (album_id = $album_id OR $album_id IS NULL)
            )
            ORDER BY album, track_number
        """,
            track_id=track_id,
            album_id=album_id,
        )

    def get_playlists(self) -> List[sqlite3.Row]:
        return self.execute("""
            SELECT
                id,
                title,
                tracks,
                duration,
                last_play,
                play_count
            FROM playlist_view
        """)

    def get_playlist_tracks(self, playlist_id: int) -> List[sqlite3.Row]:
        return self.execute("""
            SELECT
                id,
                title,
                artist,
                album,
                album_id,
                genre,
                track_number,
                release_date,
                duration,
                path,
                last_play,
                play_count,
                last_modified,
                year
            FROM track_view
            LEFT JOIN playlist_track ON track_view.id = playlist_track.track_id
            WHERE playlist_track.playlist_id = $playlist_id
            ORDER BY (
                CASE
                    WHEN playlist_track.`order` IS NULL THEN RANDOM()
                    ELSE playlist_track.`order`
                END
            );
        """,
            playlist_id=playlist_id,
        )

    def get_shuffle(self) -> List[sqlite3.Row]:
        return self.execute("""
            SELECT * FROM track_view
            WHERE (play_count >= 5) AND (duration >= 50) AND (duration < 1000)
            AND (last_play < strftime('%s', 'now') - 90*24*60*60)
            AND (
                album_id IS NULL OR
                album_id NOT IN (SELECT id FROM album_view WHERE play_count >= 5)
            )
            ORDER BY last_play
        """)

    def get_scrobble_backlog(self) -> List[sqlite3.Row]:
        return self.execute("""
            SELECT
                track_view.id,
                track_view.artist,
                track_view.album_artist,
                track_view.title,
                track_view.album,
                track_view.track_number,
                play.timestamp
            FROM play
            LEFT JOIN track_view ON play.track_id=track_view.id
            WHERE play.timestamp IS NOT NULL AND play.scrobbled = 0
        """)


def get_db() -> Database:
    if 'db' not in g:
        g.db = Database(get_config('files')['db_path'])

    return g.db


def setup_db(app):
    @app.teardown_appcontext
    def teardown_db(exception):
        db = g.pop('db', None)

        if db is not None:
            if exception:
                db.conn.rollback()
            else:
                db.conn.commit()

            db.conn.close()
