from flask import current_app, g
import lyricsgenius
import pylast

from .util import get_config


def get_genius():
    if 'genius' not in g:
        settings = get_config('genius')

        g.genius = lyricsgenius.Genius(settings['access_token'])

    return g.genius


def get_lastfm():
    if 'lastfm' not in g:
        settings = get_config('lastfm')

        g.lastfm = pylast.LastFMNetwork(
            api_key=settings['api_key'],
            api_secret=settings['api_secret'],
            session_key = settings['session_key'],
            username=settings['username'],
            password_hash=pylast.md5(settings['password']),
        )

    return g.lastfm
