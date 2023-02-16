from flask_restx import (
    Namespace,
    Resource,
    fields,
    reqparse,
)

from music_server.db import get_db
from music_server.util import get_config

from .shared import api_cache, track_fields

api = Namespace('playlists')

@api.route('/')
class Playlists(Resource):
    method_decorators = [api_cache]

    fields = {
        'id': fields.Integer,
        'title': fields.String,
        'tracks': fields.Integer,
        'duration': fields.Integer,
        'last_play': fields.Integer(default=None),
        'play_count': fields.Integer,
    }

    @api.marshal_with(fields)
    def get(self):
        return get_db().get_playlists()


@api.route('/<int:playlist_id>/tracks')
class PlaylistTracks(Resource):

    fields = track_fields

    @api.marshal_with(fields)
    def get(self, playlist_id):
        return get_db().get_playlist_tracks(playlist_id)


