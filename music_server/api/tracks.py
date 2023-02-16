import re

from flask_restx import (
    Namespace,
    Resource,
    fields,
    reqparse,
)
import pylast

from music_server.db import get_db
from music_server.external import get_genius, get_lastfm
from music_server.util import get_config

from .shared import api_cache, track_fields

api = Namespace('tracks')


@api.route('/')
class Tracks(Resource):
    method_decorators = [api_cache]

    fields = track_fields

    @api.marshal_with(fields)
    def get(self):
        return get_db().get_tracks()


@api.route('/<int:track_id>/lyrics')
class Lyrics(Resource):
    fields = {
        'lyrics': fields.String,
        'url': fields.String,
    }

    @api.marshal_with(fields)
    def get(self, track_id):
        if get_config('demo_mode'):
            return None, 401

        db = get_db()
        track = get_db().get_tracks(track_id=track_id)[0]

        genius_result = get_genius().search_song(track['title'], track['artist'])
        if genius_result:
            lyrics = genius_result.lyrics.strip()
            lyrics = re.sub(r'^.+Lyrics', '', lyrics)
            lyrics = re.sub(r'\d*Embed:?Share URL:?Copy:?Embed:?Copy$', '', lyrics)
            lyrics = re.sub(r'\d*Embed$', '', lyrics)
            lyrics = re.sub(r'You might also like', '', lyrics)
            lyrics = re.sub(f'See {track["artist"]} Live', '', lyrics)
            lyrics = re.sub(r'Get tickets as low as \$\d+', '', lyrics)
            return {
                'lyrics': lyrics,
                'url': genius_result.url,
            }

        return {
            'lyrics': 'No lyrics found.',
            'url': None,
        }


@api.route('/<int:track_id>/submit-now-playing')
class SubmitNowPlaying(Resource):
    def put(self, track_id):
        if get_config('demo_mode'):
            return None, 401

        track = get_db().get_tracks(track_id=track_id)[0]

        get_lastfm().update_now_playing(
            artist=track['artist'],
            title=track['title'],
            album=track['album'],
            album_artist=track['album_artist'],
            track_number=track['track_number'],
        )


@api.route('/<int:track_id>/submit-play')
class SubmitPlay(Resource):
    def put(self, track_id):
        if get_config('demo_mode'):
            return None, 401

        parser = reqparse.RequestParser()
        parser.add_argument('timestamp', type=int)
        args = parser.parse_args()
        timestamp = args['timestamp']

        db = get_db()

        db.execute("""
            UPDATE track
            SET row_modified = $timestamp
            WHERE id = $track_id
        """,
            track_id=track_id,
            timestamp=timestamp,
        )

        db.execute("""
            INSERT INTO play (track_id, timestamp, scrobbled)
            VALUES ($track_id, $timestamp, 0)
        """,
            track_id=track_id,
            timestamp=timestamp,
        )

        db.conn.commit()

        backlog = db.get_scrobble_backlog()

        try:
            for track in backlog:
                get_lastfm().scrobble(
                    artist=track['artist'],
                    title=track['title'],
                    album=track['album'],
                    album_artist=track['album_artist'],
                    track_number=track['track_number'],
                    timestamp=track['timestamp'],
                )

                db.execute("""
                    UPDATE play
                    SET scrobbled = 1
                    WHERE track_id = $track_id AND timestamp = $timestamp
                """, track_id=track['id'], timestamp=track['timestamp'])

                if len(backlog) > 1:
                    time.sleep(0.1)
        except pylast.NetworkError:
            # oh well, we'll get 'em next time
            return None, 503
