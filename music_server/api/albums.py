from flask_restx import (
    Namespace,
    Resource,
    fields,
    reqparse,
)

from music_server.db import get_db
from music_server.util import get_config

from .shared import api_cache

api = Namespace('albums')


@api.route('/')
class Albums(Resource):
    method_decorators = [api_cache]

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

    @api.marshal_with(fields)
    def get(self):
        return get_db().get_albums()


@api.route('/<int:album_id>')
class Album(Resource):
    # method_decorators = {'get': [api_cache]}

    fields = Albums.fields

    @api.marshal_with(fields)
    def get(self, album_id):
        return get_db().get_albums(album_id)[0]

    @api.marshal_with(fields)
    def put(self, album_id):
        parser = reqparse.RequestParser()
        parser.add_argument('starred', type=bool)
        args = parser.parse_args()

        db = get_db()
        db.edit_album(album_id, args['starred'])

        return db.get_albums(album_id)[0]
