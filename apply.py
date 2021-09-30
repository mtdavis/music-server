import datetime
import json
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


ARTIST_MAP = {
    "Rolling Stones": "The Rolling Stones",
    "R.E.M.": "REM",
    "大谷幸": "Kow Otani",
    "J. Geils Band": "The J. Geils Band",
    # "Barenaked Ladies": "",
    "布袋寅泰": "Tomoyasu Hotei",
    # "Parliament": "",
    "The London Philharmonic Orchestra": "London Philharmonic Orchestra",
    # "Robert Johnson": "",
    "The Edgar Winter Group": "Edgar Winter Group",
    "GZA": "GZA/Genius",
    # "Explosions in the Sky": "",
    "MC Frontalot feat. Brad Sucks": "MC Frontalot",
    # "De La Soul": "",
    "Tom Petty and The Heartbreakers": "Tom Petty & the Heartbreakers",
    "Booker T. & the MG's": "Booker T & The MGs",
    # "Oysterhead": "",
    # "Modest Mouse": "",
    # "Colonel Les Claypool's Fearless Flying Frog Brigade": "",
    # "Mahavishnu Orchestra": "",
    "U.N.K.L.E.": "UNKLE",
    # "Les Claypool And The Holy Mackerel": "",
    "London Philharmonic Ochestra": "London Philharmonic Orchestra",
    # "A Tribe Called Quest": "",
    # "Jonti": "",
    "The Spinners": "Spinners",
    "a-ha": "Aha",
    "? and the Mysterians": "? & The Mysterians",
    "Mos Def & Talib Kweli": "Black Star",
    # "Rush": "",
    # "The Spencer Davis Group": "",
    # "Charlie Parker": "",
    "The Animals": "Animals",
    # "John Mayer Trio": "",
    # "Miles Davis": "",
    "The Blind Boys Of Alabama": "Blind Boys of Alabama",
    # "Colonel Claypool's Bucket of Bernie Brains": "",
    # "Girl Talk": "",
    # "The Beach Boys": "",
    # "The Philadelphia Experiment": "",
    # "Graham Parker": "",
    # "Jeff Buckley": "",
    # "The Doors": "",
    # "Los Lonely Boys": "",
    # "Boz Scaggs": "",
    # "Steppenwolf": "",
    # "The Les Claypool Frog Brigade": "",
    # "The String Quartet": "",
    # "Cold Chisel": "",
    "Garmin": "Steve Grimmett Band",
    # "Music For Programming": "",
    # "XTC": "",
    # "DJ Bolivia": "",
    # "Stevie Ray Vaughan": "",
    # "Chic": "",
    # "Chuck Berry": "",
    # "Coldplay": "",
    # "Easy Star All*Stars": "",
    # "Ellen Yates": "",
    # "Gogol Bordello": "",
    # "Herb Alpert and the Tijuana Brass": "",
    # "Lapin Machin": "",
    # "TERU": "",
    # "The Flying Burrito Brothers": "",
    # "Antsy Pants": "",
    # "Blind Melon": "",
    # "Bright Eyes": "",
    "Camerhil": "Tim Cameron",
    # "Charlie Feathers": "",
    # "Cold War Kids": "",
    # "David Bazan's Black Cloud": "",
    # "Dmitri Shostakovich": "",
    # "Doveman": "",
    # "FRAN.CE": "",
    # "Flash Hawk Parlor Ensemble": "",
    # "Frank Zappa": "",
    # "Freelance Hairdresser": "",
    # "Glen Phillips": "",
    # "Hootie & The Blowfish": "",
    # "Ivy": "",
    # "Jeff Lewis Band": "",
    # "John Frusciante": "",
    # "John Vanderslice": "",
    # "Leroy": "",
    # "Marissa Nadler (Feat. Black Hole Infinity)": "",
    # "Mobius Band": "",
    # "My Brightest Diamond": "",
    # "Pete Townshend": "",
    # "Peter H. Cropes": "",
    # "Rockabye Baby": "",
    # "Samson Dalonoga (Feat. The Found Sound Orchestra)": "",
    "Saturday Night Live": "The Lonely Island",
    # "Shawn Lee": "",
    # "Sia": "",
    # "Slaraffenland": "",
    # "Sneaker Pimps": "",
    # "Space Bee": "",
    # "Ten Years After": "",
    # "The Dresden Dolls": "",
    # "The Illuminati": "",
    "The Jimi Hendrix Experience": "Jimi Hendrix",
    # "The Magnetic Fields": "",
    # "The Marmalade": "",
    # "The Servant": "",
    # "The Smithereens": "",
    # "The Surfaris": "",
    # "The Twilight Sad": "",
    # "The Wave Pictures": "",
    # "Tig Notaro": "",
    # "Tobias, Wife of G.O.B., George Michael": "",
    # "Vampire Weekend": "",
    # "Violent Femmes": "",
    # "Yu Miyake, Masayuki Tanaka": "",
}

TITLE_MAP = {
    ("clutch", "la curandera"): "(notes from the trial of) la curandera",
    ("clutch", "promoter"): "promoter (of earthbound causes)",
    ("clutch", "swollen goat"): "(in the wake of) swollen goat",
    ("ennio morricone", "the ecstacy of gold"): "the ecstasy of gold",
    ("flight of the conchords", "hurt feelings (instrumental)"): "hurt feelings (reprise)",
    ("fountains of wayne", "...baby one more time"): "... baby one more time",
    ("goat", "det som aldrig forandras / diarabi"): "det som aldrig forandras/diarabi",
    ("led zeppelin", "traveling riverside blues"): "travelling riverside blues",
    ("sublime", "what i got (album version (explicit)) [explicit]"): "what i got",
    ("tenacious d", "kyle took a bullet for me"): "kyle took a bullet",
    ("the decemberists", "the perfect crime no. 2"): "the perfect crime #2",
    ("the decemberists", "the perfect crime no.2"): "the perfect crime #2",
    ("the kinks", "shangri-la"): "shangri la",
    ("wolfmother", "withcraft"): "witchcraft",
    ("the decemberists", "the crane wife, pt. 3"): "the crane wife 3",
    ("the decemberists", "the crane wife, pts. 1 & 2"): "the crane wife 1 & 2",
    ("third eye blind", "semi charmed life"): "semi-charmed life",
    ("clutch", "regulator"): "the regulator",
    ("clutch", "book, saddle, and go"): "book, saddle, & go",
    ("dungen", "en gång i År kom det en tår"): "en gång i år kom det en tår",
    ("dungen", "svart Är himlen"): "svart är himlen",
    ("jimi hendrix", "voodoo chile (slight return)"): "voodoo child (slight return)",
    ("pink floyd", "several species of small furry animals"): "several species of small furry animals gathered together in a cave and grooving with a pict",
    ("pond", "whatever happened to the million head collide?"): "whatever happened to the million head collide",
    ("tame impala", "it's not meant to be"): "it is not meant to be",
    ("the holydrug couple", "baby, i’m going away"): "baby, i'm going away",
    ("the holydrug couple", "i don’t feel like it"): "i don't feel like it",
    ("the lonely island", "who said we're wack"): "who said we're wack?",
    ("atoms for peace", "judge, jury and executioner"): "judge jury and executioner",
    ("boards of canada", "happy cycling [*]"): "happy cycling",
    ("dungen", "finns det nÅgon mÖjlighet"): "finns det någon möjlighet",
    ("dungen", "ingenting Är sig likt"): "ingenting är sig likt",
    ("dungen", "mÅlerÅs finest"): "målerås finest",
    ("dungen", "sÄtt att se"): "sätt att se",
    ("flight of the conchords", "albie"): "albi",
    ("jethro tull", "cross eyed mary"): "cross-eyed mary",
    ("stevie wonder", "uptight"): "uptight (everything's alright)",
    ("the bakerton group", "1906 part 2"): "1906, part ii",
    ("the decemberists", "the hazards of love (revenge!)"): "the hazards of love 3 (revenge!)",
    ("shad", "intro: the quest for glory"): "intro: quest for glory",
    ("the dandy warhols", "(you come in) burned"): "you come in burned",
    ("the dandy warhols", "rock bottom"): "hit rock bottom",
    ("the who", "go to the mirror boy"): "go to the mirror",
    ("eagles of death metal", "wannabe in la"): "wannabe in l.a.",
    ("kutiman", "i m new"): "i am new",
    ("the dandy warhols", "seti vs the wow! signal"): "seti vs. the wow! signal",
    ("the decemberists", "till the water’s all long gone"): "till the water's all long gone",
    ("boston", "foreplay-long time"): "foreplay/long time",
    ("colours run", "beautiful waste of time (demo)"): "beautiful waste of time",
    ("jimi hendrix", "manic depresion"): "manic depression",
    ("little people", "behind closed doors"): "behind closed doors (edit)",
    ("portugal. the man", "guns and dogs"): "guns & dogs",
    ("tame impala", "runaway, houses, city, clouds"): "runway, houses, city, clouds",
    ("the white stripes", "why can't you be nicer to me"): "why can't you be nicer to me?",
    ("justice", "tthhee pparrttyy"): "tthhee ppaarrttyy",
    ("melody's echo chamber", "quand vas tu rentrer"): "quand vas tu rentrer?",
    ("death", "freakin' out"): "freakin out",
    ("radiohead", "myxamatosis"): "myxomatosis",
    ("boards of canada", "84 pontiac dream"): "'84 pontiac dream",
    ("bad company", "can't get enough of your love"): "can't get enough",
    ("flight of the conchords", "cheer up, murray"): "cheer up murray",
    ("flight of the conchords", "leggie blonde"): "leggy blonde",
    ("katamari damacy", "katamari on the rock"): "katamari on the rock ~ main theme",
    ("fountains of wayne", "hotel majestic"): "the hotel majestic",
    ("colours run", "before the war (demo)"): "before the war",
    ("death", "where do we go from here"): "where do we go from here???",
    ("fountains of wayne", "92 subaru"): "'92 subaru",
    ("dungen", "det du tänker idag Är du i morgon"): "det du tänker idag är du i morgon",
    ("flight of the conchords", "prince of parties"): "the prince of parties",
    ("the white stripes", "hypnotise"): "hypnotize",
    ("clutch", "you can't stop the progress"): "you can't stop progress",
    ("the avalanches", "brains"): "soca! sirens! brains!",
    ("the dandy warhols", "mohamed"): "mohammed",
}


def sqlite_lower(string):
    return string.translate(str.maketrans(
        'ABCDEFGHJIKLMNOPQRSTUVWXYZ', 'abcdefghjiklmnopqrstuvwxyz'))


def get_existing_play_timestamps(database):
    result = {}

    records = database.execute("""
        SELECT timestamp, LOWER(t.artist) as artist, LOWER(t.title) as title
        FROM play2 p
        LEFT JOIN track_view t
        ON p.track_id = t.id
        WHERE timestamp IS NOT NULL
    """)

    for record in records:
        tuple = (record['artist'], record['title'].strip())
        if tuple not in result:
            result[tuple] = []
        result[tuple].append(record['timestamp'])

    return result


def get_ambiguous_tracks(database):
    records = database.execute("""
        SELECT artist_id, title
        FROM track_view
        WHERE play_count > 0
        GROUP BY artist_id, title
        HAVING COUNT(*) > 1;
    """)

    return [
        (record['artist_id'], record['title'])
        for record in records
    ]


def play_exists(artist, title, timestamp, existing_play_timestamps):
    existing_plays = existing_play_timestamps.get((artist, title), [])
    return timestamp in existing_plays


def close_play_exists(artist, title, timestamp, existing_play_timestamps):
    existing_plays = existing_play_timestamps.get((artist, title), [])
    for existing_play in existing_plays:
        if abs(timestamp - existing_play) < 1000:
            return True

    return False


def main():
    ################################################################################
    ##### Set up database.

    database = Database('./db.sqlite')
    database.execute("""
        DROP TABLE IF EXISTS scrobble
    """)
    database.execute("""
        DROP TABLE IF EXISTS play2
    """)

    database.execute("""
        CREATE TABLE scrobble (
            id INTEGER NOT NULL PRIMARY KEY,
            raw_artist TEXT,
            raw_title TEXT,
            raw_timestamp INTEGER,
            artist_id INTEGER,
            track_id INTEGER,
            nice_timestamp TEXT,
            exclusion_reason TEXT,
            FOREIGN KEY (artist_id) REFERENCES artist(id),
            FOREIGN KEY (track_id) REFERENCES track(id)
        )
    """)

    database.execute("""
        CREATE TABLE play2 (
            id INTEGER NOT NULL PRIMARY KEY,
            track_id INTEGER NOT NULL,
            timestamp INTEGER,
            scrobbled BOOLEAN NOT NULL,
            inferred BOOLEAN,
            FOREIGN KEY (track_id) references track(id)
        )
    """)

    database.execute("""
        INSERT INTO play2 (track_id, timestamp, scrobbled)
        SELECT track_id, timestamp, scrobbled FROM play
    """)

    ################################################################################
    ##### Load in scrobbles.

    existing_play_timestamps = get_existing_play_timestamps(database)

    with open('scrobbles-ogreatone43-1617987200.json') as infile:
        pages = json.load(infile)

    print("Loading scrobbles...")

    count = 0
    for page in pages:
        for scrobble in page:
            artist = scrobble['artist']['#text']
            artist = sqlite_lower(ARTIST_MAP.get(artist, artist).strip())

            title = sqlite_lower(scrobble['name'].strip())
            if (artist, title) in TITLE_MAP:
                title = TITLE_MAP[(artist, title)]

            timestamp = int(scrobble['date']['uts'])

            exclusion_reason = None
            if play_exists(artist, title, timestamp, existing_play_timestamps):
                exclusion_reason = 'play-exists'
            elif close_play_exists(artist, title, timestamp, existing_play_timestamps):
                exclusion_reason = 'close-play-exists'

            database.execute("""
                INSERT INTO scrobble (
                    raw_artist,
                    raw_title,
                    raw_timestamp,
                    nice_timestamp,
                    exclusion_reason
                )
                VALUES (
                    :artist,
                    :title,
                    :timestamp,
                    :nice_timestamp,
                    :exclusion_reason
                )
            """,
                artist=artist,
                title=title,
                timestamp=timestamp,
                nice_timestamp=datetime.datetime.fromtimestamp(timestamp).isoformat(),
                exclusion_reason=exclusion_reason
            )
            count += 1

    ################################################################################
    ##### Determine artists.

    print('Determining artists...')

    database.execute("""
        UPDATE scrobble SET artist_id = (
            SELECT id FROM artist WHERE LOWER(name)=LOWER(scrobble.raw_artist)
        )
        WHERE exclusion_reason IS NULL
    """)

    database.execute("""
        UPDATE scrobble
        SET exclusion_reason = 'unknown-artist'
        WHERE (
            artist_id IS NULL AND
            exclusion_reason IS NULL
        )
    """)

    ################################################################################
    ##### Remove ambiguous tracks.

    print('Determining ambiguous tracks...')

    for artist_id, title in get_ambiguous_tracks(database):
        database.execute("""
            UPDATE scrobble
            SET exclusion_reason = 'ambiguous-track'
            WHERE (
                artist_id=:artist_id AND
                raw_title=LOWER(:title) AND
                exclusion_reason IS NULL
            )
        """,
            artist_id=artist_id,
            title=title,
        )

    ################################################################################
    ##### Determine tracks.

    print('Determining tracks...')

    database.execute("""
        UPDATE scrobble SET track_id = (
            SELECT id
            FROM track_view
            WHERE (
                LOWER(title)=LOWER(scrobble.raw_title) AND
                artist_id=scrobble.artist_id
            )
        )
        WHERE exclusion_reason IS NULL
    """)

    database.execute("""
        UPDATE scrobble
        SET exclusion_reason = 'unknown-track'
        WHERE (
            track_id IS NULL AND
            exclusion_reason IS NULL
        )
    """)

    ################################################################################
    ##### Update play2.

    print('Updating play2...')

    scrobble_records = database.execute("""
        SELECT track_id, raw_timestamp
        FROM scrobble
        WHERE exclusion_reason IS NULL
    """)

    for scrobble in Bar('processing').iter(scrobble_records):
        database.execute("""
            UPDATE play2
            SET timestamp = :timestamp, inferred = TRUE
            WHERE id = (
                SELECT id FROM play2
                WHERE (
                    track_id = :track_id AND
                    timestamp IS NULL
                )
                LIMIT 1
            )
        """,
            timestamp=scrobble['raw_timestamp'],
            track_id=scrobble['track_id'],
        )

    database.conn.commit()

if __name__ == '__main__':
    main()
