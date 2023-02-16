from flask_restx import (
    Namespace,
    Resource,
    fields,
    reqparse,
)

from music_server.db import get_db

from .shared import track_fields

api = Namespace('shuffle')


@api.route('/')
class Shuffle(Resource):
    fields = track_fields

    @api.marshal_with(fields)
    def get(self):
        return get_db().get_shuffle()
