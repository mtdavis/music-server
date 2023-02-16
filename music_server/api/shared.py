import datetime
import functools

from flask import request
from flask_restx import fields

from music_server.db import get_db

track_fields = {
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
        if not isinstance(response, tuple) or len(response) == 1:
            response = response, 200, {}
        elif len(response) == 2:
            response = *response, {}

        # add cache headers
        response[2]['Last-Modified'] = last_modified.strftime(dt_format)
        response[2]['Cache-Control'] = 'max-age=1'

        return response

    return wrapper
