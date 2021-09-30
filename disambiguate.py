import datetime
import json
import readline
import sqlite3
import unicodedata
from progress.bar import Bar


class Database:
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

    def execute(self, query, **kwargs):
        self.cursor.execute(query, kwargs)
        return self.cursor.fetchall()

    def get_ambiguous_scrobbles(self):
        return self.execute("""
            SELECT id, raw_artist, raw_title, raw_timestamp
            FROM scrobble
            WHERE exclusion_reason = 'ambiguous-track'
            ORDER BY raw_artist, raw_title, raw_timestamp
        """)

    def get_matching_tracks(self, artist, title):
        return self.execute("""
            SELECT id, album, track_number
            FROM track_view
            WHERE LOWER(artist) = :artist AND LOWER(title) = :title
        """,
            artist=artist,
            title=title,
        )

    def get_plays_for_track_id(self, track_id):
        return self.execute("""
            SELECT id, timestamp
            FROM play
            WHERE track_id = :track_id
            ORDER BY play.timestamp
        """,
            track_id=track_id
        )

    def get_nearby_plays(self, timestamp):
        return self.execute("""
            SELECT track_view.id, play.timestamp, track_view.album, track_view.track_number
            FROM play
            LEFT JOIN track_view ON play.track_id = track_view.id
            WHERE ABS(play.timestamp - :timestamp) < 3600
            ORDER BY play.timestamp
        """,
            timestamp=timestamp
        )

    def update_play(self, track_id, timestamp):
        self.execute("""
            UPDATE play
            SET timestamp = :timestamp
            WHERE id IN (
                SELECT id
                FROM play
                WHERE track_id = :track_id AND timestamp IS NULL
                LIMIT 1
            )
        """,
            track_id=track_id,
            timestamp=timestamp
        )

    def update_scrobble(self, scrobble_id):
        self.execute("""
            UPDATE scrobble
            SET exclusion_reason = 'disambiguated_track'
            WHERE id = :scrobble_id
        """,
            scrobble_id=scrobble_id
        )


def iso(timestamp):
    if timestamp:
        return datetime.datetime.fromtimestamp(timestamp).isoformat()
    return '<  No timestamp  > '


def get_selection(database, options):
    while True:
        selection = input(
            "Choose a track # to assign this timestamp, or [skip/exit/commit]: ")

        if not selection:
            return 'skip'

        if selection == 'commit':
            database.conn.commit()
            print("OK, committed")
            continue

        if selection in ['skip', 'exit']:
            return selection

        selection = int(selection)

        if selection not in options:
            print('Not a matching track')
            continue

        return selection


def main():
    database = Database('./db.sqlite')

    ambiguous_scrobbles = database.get_ambiguous_scrobbles()

    count = 0
    for scrobble in ambiguous_scrobbles:
        print('=~' * 60)
        print('Scrobble:')
        print(f"\t{scrobble['raw_artist']}")
        print(f"\t{scrobble['raw_title']}")
        print(f"\t{iso(scrobble['raw_timestamp'])}")
        print()

        nearby_plays = database.get_nearby_plays(scrobble['raw_timestamp'])
        print('Nearby plays:')
        printed_gap = False
        for nearby_play in nearby_plays:
            if not printed_gap and nearby_play['timestamp'] > scrobble['raw_timestamp']:
                print(f"\t{iso(scrobble['raw_timestamp'])}: **********")
                printed_gap = True

            print(f"\t{iso(nearby_play['timestamp'])}: Track#{nearby_play['id']} ({nearby_play['album']} #{nearby_play['track_number']})")

        if not printed_gap:
            print(f"\t{iso(scrobble['raw_timestamp'])}: **********")

        print()

        matches = database.get_matching_tracks(scrobble['raw_artist'], scrobble['raw_title'])
        print()
        print('Track IDs with matching artist/title:')
        print()
        for match in matches:
            print(f"\tTrack#{match['id']} ({match['album']} #{match['track_number']})")
            match_plays = database.get_plays_for_track_id(match['id'])
            nulls = [m for m in match_plays if m['timestamp'] is None]

            if len(nulls) > 0:
                first_null = nulls[0]
                print(f"\t\tNo timestamp:       Play#{first_null['id']} ({len(nulls)} total)")

            # for match_play in match_plays:
            #     if match_play['timestamp'] is None:
            #         continue

            #     print(f"\t\t{iso(match_play['timestamp'])} Play#{match_play['id']}")

            print()

        selection = get_selection(database, [m['id'] for m in matches])

        if selection == 'skip':
            continue
        elif selection == 'exit':
            break
        else:
            database.update_play(selection, scrobble['raw_timestamp'])
            database.update_scrobble(scrobble['id'])
    
    database.conn.commit()



if __name__ == '__main__':
    main()
