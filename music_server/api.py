import collections
import datetime
import functools
import time

from flask import (
    Blueprint,
    current_app,
    request,
)
from flask_restful import (
    Api,
    fields,
    marshal_with,
    reqparse,
    Resource,
)
import pylast

from .db import get_db
from .external import get_genius, get_lastfm
from .scan import scan
from .util import get_config
from . import stats


def api_cache(func):
    dt_format = '%a, %d %b %Y %H:%M:%S %Z'

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        last_modified = datetime.datetime.fromtimestamp(
            get_db().get_last_modified(), datetime.timezone.utc)

        if_modified_since = request.headers.get('if-modified-since', None)
        if if_modified_since:
            if_modified_since = datetime.datetime.strptime(if_modified_since, dt_format)
            # python can't parse timezones? https://bugs.python.org/issue22377
            if_modified_since = if_modified_since.replace(tzinfo=datetime.timezone.utc)

            if if_modified_since >= last_modified:
                return None, 304, {
                    'Last-Modified': last_modified.strftime(dt_format)
                }

        response = func(*args, **kwargs)

        # coerce response structure to (json, status_code, headers)
        if type(response) != tuple or len(response) == 1:
            response = response, 200, {}
        elif len(response) == 2:
            response = *response, {}

        # add cache headers
        response[2]['Last-Modified'] = last_modified.strftime(dt_format)
        response[2]['Cache-Control'] = 'max-age=1'

        return response

    return wrapper


class Album(Resource):
    method_decorators = {'get': [api_cache]}

    fields = {
        'id': fields.Integer,
        'album_artist': fields.String,
        'album': fields.String,
        'genre': fields.String,
        'duration': fields.Integer,
        'tracks': fields.Integer,
        'year': fields.Integer,
        'release_date': fields.Integer(default=None),
        'last_play': fields.Integer(default=None),
        'play_count': fields.Integer,
    }

    @marshal_with(fields)
    def get(self):
        return get_db().get_albums()


class Track(Resource):
    method_decorators = {'get': [api_cache]}

    fields = {
        'id': fields.Integer,
        'title': fields.String,
        'artist': fields.String,
        'album': fields.String,
        'album_id': fields.Integer(default=None),
        'genre': fields.String,
        'track_number': fields.Integer(default=None),
        'release_date': fields.Integer(default=None),
        'duration': fields.Integer,
        'path': fields.String,
        'last_play': fields.Integer(default=None),
        'play_count': fields.Integer,
        'last_modified': fields.Integer(default=None),
        'year': fields.Integer(default=None),
    }

    @marshal_with(fields)
    def get(self):
        return get_db().get_tracks()


class Playlist(Resource):
    method_decorators = {'get': [api_cache]}

    fields = {
        'id': fields.Integer,
        'title': fields.String,
        'tracks': fields.Integer,
        'duration': fields.Integer,
        'last_play': fields.Integer(default=None),
        'play_count': fields.Integer,
    }

    @marshal_with(fields)
    def get(self):
        return get_db().get_playlists()


class PlaylistTracks(Resource):
    fields = Track.fields

    @marshal_with(fields)
    def get(self, playlist_id):
        return get_db().get_playlist_tracks(playlist_id)


class Shuffle(Resource):
    fields = Track.fields

    @marshal_with(fields)
    def get(self):
        return get_db().get_shuffle()


class Lyrics(Resource):
    fields = {
        'lyrics': fields.String,
        'url': fields.String,
    }

    @marshal_with(fields)
    def get(self, track_id):
        if get_config('demo_mode'):
            return None, 401

        db = get_db()
        track = get_db().get_tracks(track_id=track_id)[0]

        genius_result = get_genius().search_song(track['title'], track['artist'])
        if genius_result:
            return {
                'lyrics': genius_result.lyrics.strip(),
                'url': genius_result.url,
            }

        return {
            'lyrics': 'No lyrics found.',
            'url': None,
        }


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


class Scan(Resource):
    def put(self):
        if get_config('demo_mode'):
            return None, 401

        parser = reqparse.RequestParser()
        parser.add_argument('dry_run', type=bool)
        args = parser.parse_args()

        scan_results = scan(dry_run=args['dry_run'])

        return scan_results


class Stats(Resource):
    method_decorators = {'get': [api_cache]}

    def get(self):
        if get_config('demo_mode'):
            return None, 401

        return {
            'genres_over_time': stats.get_genres_over_time(),
            'artists_over_time': stats.get_artists_over_time(),
            'albums_over_time': stats.get_albums_over_time(),
        }


api_blueprint = Blueprint('api', __name__)
api = Api(api_blueprint)

api.add_resource(Album, '/albums')
api.add_resource(Track, '/tracks')
api.add_resource(Playlist, '/playlists')
api.add_resource(PlaylistTracks, '/playlist/<int:playlist_id>/tracks')
api.add_resource(Shuffle, '/shuffle')
api.add_resource(Lyrics, '/track/<int:track_id>/lyrics')
api.add_resource(SubmitNowPlaying, '/track/<int:track_id>/submit-now-playing')
api.add_resource(SubmitPlay, '/track/<int:track_id>/submit-play')
api.add_resource(Scan, '/scan')
api.add_resource(Stats, '/stats')
