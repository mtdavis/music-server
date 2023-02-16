import io
import pathlib

import eyed3
from flask import (
    Blueprint,
    current_app,
    render_template_string,
    Response,
    send_from_directory,
    send_file,
)

from .db import get_db
from .util import escape_for_file_system, get_config


resources_blueprint = Blueprint('resources', __name__)


@resources_blueprint.route('/')
def handle_root():
    with open('./client/dist/index.html') as template:
        return render_template_string(
            template.read(),
            demo_mode=get_config('demo_mode')
        )


@resources_blueprint.route('/<path:path>')
def handle_static(path: str):
    return send_from_directory('../client/dist', path)


@resources_blueprint.route('/stream/<path:path>')
def handle_stream(path: str):
    return send_from_directory(
        get_config('files')['base_stream_path'], path)


@resources_blueprint.route('/art/<int:track_id>')
def handle_art(track_id: int):
    base_stream_path = pathlib.Path(get_config('files')['base_stream_path'])

    db = get_db()
    track = db.get_tracks(track_id=track_id)[0]
    track_directory = pathlib.Path(track['path']).parent
    album = escape_for_file_system(track['album'])

    possible_paths = [
        track_directory / f'{album}.jpg',
        track_directory / f'{album}.png',
        track_directory / 'folder.jpg',
        track_directory / 'folder.png',
        track_directory / 'cover.jpg',
        track_directory / 'cover.png',
    ]

    for possible_path in possible_paths:
        if (base_stream_path / possible_path).exists():
            return send_from_directory(base_stream_path, possible_path)

    metadata = eyed3.load(base_stream_path / track['path'])

    if len(metadata.tag.images) > 0:
        return send_file(
            io.BytesIO(metadata.tag.images[0].image_data),
            mimetype=metadata.tag.images[0].mime_type
        )

    return 'Album art not found', 404
