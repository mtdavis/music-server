import re

from flask import current_app


def escape_for_file_system(string: str) -> str:
    string = re.sub(r'[\\/:*?"<>|]', '-', string)
    string = string.strip('. ')
    return string


def get_config(key: str):
    return current_app.config['MUSIC_SERVER'][key]
