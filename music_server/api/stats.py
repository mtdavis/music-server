from flask_restx import (
    Namespace,
    Resource,
    fields,
    reqparse,
)

from music_server.db import get_db
from music_server.util import get_config
from music_server import stats

api = Namespace('stats')


@api.route('/')
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