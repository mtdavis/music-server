import re

from flask import current_app


def escape_for_file_system(string):
    string = re.sub(r'[\\/:*?"<>|]', '-', string)
    string = string.strip('. ')
    return string


def get_config(key):
    return current_app.config['MUSIC_SERVER'][key]
