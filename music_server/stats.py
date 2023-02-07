import collections
import datetime

from .db import get_db


def get_genres_over_time():
    db = get_db()

    plays = db.execute("""
        SELECT play.timestamp, track.genre, track.duration
        FROM play
        INNER JOIN track ON play.track_id = track.id
        WHERE play.timestamp IS NOT NULL
    """)

    years = set()
    by_genre_and_year = {}

    for play in plays:
        genre = play['genre']

        year = datetime.datetime.fromtimestamp(play['timestamp']).year
        years.add(year)

        if genre not in by_genre_and_year:
            by_genre_and_year[genre] = collections.Counter()

        # use duration so that it properly reflects "time spent listening"
        # for, e.g., long single-track albums.
        by_genre_and_year[genre][year] += play['duration']

    result = [
        {
            'id': genre,
            'data': [
                {'x': year, 'y': counts_by_year[year]}
                for year in sorted(years)[1:]  # exclude sparse first year
            ]
        }
        for genre, counts_by_year in by_genre_and_year.items()
    ]

    return result


def get_artists_over_time():
    db = get_db()

    plays = db.execute("""
        SELECT play.timestamp, track_view.artist, track_view.duration
        FROM play
        INNER JOIN track_view ON play.track_id = track_view.id
        WHERE play.timestamp IS NOT NULL
    """)

    years = set()
    by_year_and_artist = {}

    for play in plays:
        artist = play['artist']

        year = datetime.datetime.fromtimestamp(play['timestamp']).year
        years.add(year)

        if year not in by_year_and_artist:
            by_year_and_artist[year] = collections.Counter()

        # use duration so that it properly reflects "time spent listening"
        # for, e.g., long single-track albums.
        by_year_and_artist[year][artist] += play['duration']

    artist_ranks = {}
    for year, artists in by_year_and_artist.items():
        for rank, (artist, _) in enumerate(artists.most_common(25)):
            if artist not in artist_ranks:
                artist_ranks[artist] = {}

            artist_ranks[artist][year] = rank + 1

    return [
        {
            'id': artist,
            'data': [
                {'x': year, 'y': ranks.get(year, None)}
                for year in sorted(years)[1:]  # exclude sparse first year
            ]
        }
        for artist, ranks in artist_ranks.items()
    ]


def get_albums_over_time():
    db = get_db()

    plays = db.execute("""
        SELECT 
            play.timestamp,
            track_view.album || '\n(' || album_view.artist || ')' AS album,
            CAST(track_view.duration AS REAL) / album_view.duration AS fraction
        FROM play
        INNER JOIN track_view ON play.track_id = track_view.id
        INNER JOIN album_view ON track_view.album_id = album_view.id
        WHERE play.timestamp IS NOT NULL AND track_view.album IS NOT NULL
    """)

    years = set()
    by_year_and_album = {}

    for play in plays:
        album = play['album']

        year = datetime.datetime.fromtimestamp(play['timestamp']).year
        years.add(year)

        if year not in by_year_and_album:
            by_year_and_album[year] = collections.Counter()

        by_year_and_album[year][album] += play['fraction']

    album_ranks = {}
    for year, albums in by_year_and_album.items():
        for rank, (album, count) in enumerate(albums.most_common(25)):
            if count <= 1.5:
                continue

            if album not in album_ranks:
                album_ranks[album] = {}

            album_ranks[album][year] = rank + 1

    return [
        {
            'id': album,
            'data': [
                {'x': year, 'y': ranks.get(year, None)}
                for year in sorted(years)[1:]  # exclude sparse first year
            ]
        }
        for album, ranks in album_ranks.items()
    ]


def get_listens_by_year():
    db = get_db()

    result_set = db.execute("""
        SELECT
            track_view.year AS x,
            CAST(SUM(track_view.duration) AS REAL) / 60 / 60 AS y
        FROM track_view
        INNER JOIN play ON play.track_id = track_view.id
        WHERE track_view.year IS NOT NULL
        GROUP BY track_view.year;
    """)

    values = {
        row['x']: row['y']
        for row in result_set
    }
    min_year = min(values.keys())
    max_year = max(values.keys())

    result = []
    for year in range(min_year, max_year + 1):
        result.append({
            'x': f"{year}-01-01",
            'y': values.get(year, 0)
        })


    return [
        {
            'id': '_',
            'data': result
        }
    ]
