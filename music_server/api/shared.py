from flask_restx import fields

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
