from flask_restx import (
    Namespace,
    Resource,
    fields,
    reqparse,
)

from music_server.db import get_db
from music_server.scan import scan
from music_server.util import get_config

api = Namespace('scan')


@api.route('/')
class Scan(Resource):
    def put(self):
        if get_config('demo_mode'):
            return None, 401

        parser = reqparse.RequestParser()
        parser.add_argument('dry_run', type=bool)
        args = parser.parse_args()

        scan_results = scan(dry_run=args['dry_run'])

        return scan_results
