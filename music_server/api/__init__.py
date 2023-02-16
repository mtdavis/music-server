from flask import Blueprint
from flask_restx import Api

from .albums import api as ns_albums
from .playlists import api as ns_playlists
from .scan import api as ns_scan
from .shuffle import api as ns_shuffle
from .stats import api as ns_stats
from .tracks import api as ns_tracks

api_blueprint = Blueprint('api', __name__)
api = Api(api_blueprint)
api.add_namespace(ns_albums)
api.add_namespace(ns_playlists)
api.add_namespace(ns_scan)
api.add_namespace(ns_shuffle)
api.add_namespace(ns_stats)
api.add_namespace(ns_tracks)
