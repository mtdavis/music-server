import collections
import datetime
import functools
import re
import time

from flask import (
    Blueprint,
    current_app,
    request,
)
from flask_restx import (
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

api_blueprint = Blueprint('api', __name__)
api = Api(api_blueprint)
ns = api.namespace('api', path='/')


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


@ns.route('/albums')
class Albums(Resource):
    # method_decorators = {'get': [api_cache]}

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
        'starred': fields.Boolean,
    }

    @ns.marshal_with(fields)
    def get(self):
        return get_db().get_albums()


@ns.route('/album/<int:album_id>')
class Album(Resource):
    # method_decorators = {'get': [api_cache]}

    fields = Albums.fields

    @ns.marshal_with(fields)
    def get(self, album_id):
        return get_db().get_albums(album_id)[0]

    @ns.marshal_with(fields)
    def put(self, album_id):
        if get_config('demo_mode'):
            return None, 401

        parser = reqparse.RequestParser()
        parser.add_argument('starred', type=bool)
        args = parser.parse_args()

        db = get_db()
        db.edit_album(album_id, args['starred'])

        return db.get_albums(album_id)[0]


@ns.route('/tracks')
class Tracks(Resource):
    # method_decorators = {'get': [api_cache]}

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

    @ns.marshal_with(fields)
    def get(self):
        return get_db().get_tracks()


@ns.route('/playlists')
class Playlists(Resource):
    # method_decorators = {'get': [api_cache]}

    fields = {
        'id': fields.Integer,
        'title': fields.String,
        'tracks': fields.Integer,
        'duration': fields.Integer,
        'last_play': fields.Integer(default=None),
        'play_count': fields.Integer,
    }

    @ns.marshal_with(fields)
    def get(self):
        return get_db().get_playlists()


@ns.route('/playlist/<int:playlist_id>/tracks')
class PlaylistTracks(Resource):
    fields = Tracks.fields

    @ns.marshal_with(fields)
    def get(self, playlist_id):
        return get_db().get_playlist_tracks(playlist_id)


@ns.route('/shuffle')
class Shuffle(Resource):
    fields = Tracks.fields

    @ns.marshal_with(fields)
    def get(self):
        return get_db().get_shuffle()


@ns.route('/track/<int:track_id>/lyrics')
class Lyrics(Resource):
    fields = {
        'lyrics': fields.String,
        'url': fields.String,
    }

    @ns.marshal_with(fields)
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


@ns.route('/track/<int:track_id>/submit-now-playing')
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


@ns.route('/track/<int:track_id>/submit-play')
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


@ns.route('/scan')
class Scan(Resource):
    def put(self):
        if get_config('demo_mode'):
            return None, 401

        parser = reqparse.RequestParser()
        parser.add_argument('dry_run', type=bool)
        args = parser.parse_args()

        scan_results = scan(dry_run=args['dry_run'])

        return scan_results


@ns.route('/stats')
class Stats(Resource):
    # method_decorators = {'get': [api_cache]}

    def get(self):
        if get_config('demo_mode'):
            return None, 401

        return {
            'genres_over_time': stats.get_genres_over_time(),
            'artists_over_time': stats.get_artists_over_time(),
            'albums_over_time': stats.get_albums_over_time(),
            'listens_by_year': stats.get_listens_by_year(),
        }
