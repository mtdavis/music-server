import json

from flask import Flask
from flask_compress import Compress

from .db import setup_db
from .resources import resources_blueprint
from .api import api_blueprint

if __name__ == '__main__':
    app = Flask(__name__)

    with open('music-server-settings.json') as config_file:
        app.config['MUSIC_SERVER'] = json.load(config_file)

    Compress(app)
    app.register_blueprint(resources_blueprint)
    app.register_blueprint(api_blueprint)
    setup_db(app)

    app.run(debug=True)
