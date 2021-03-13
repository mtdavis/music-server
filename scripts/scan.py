#!/usr/bin/env python3

import functools
import json
import logging
import os
import pathlib
import sqlite3
import sys
import multiprocessing
import time

import eyed3
from progress.bar import Bar
from tabulate import tabulate


@functools.cache
def get_settings():
    with open('../music-server-settings.json') as settings_file:
        return json.load(settings_file)


def get_year(metadata):
    if metadata.tag.getBestDate():
        return int(str(metadata.tag.getBestDate())[0:4])

    return None


class Database:
    def __init__(self, db_path):
        self.db_path = db_path

    def __enter__(self):
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()

        self.new_artists = []
        self.new_albums = []
        self.new_tracks = []
        self.modified_tracks = []
        self.deleted_tracks = []

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type or '--dry-run' in sys.argv:
            print('Rolling back')
            self.conn.rollback()
        elif self.modified:
            self.print_changes()
            print('Ctrl+c to quit, enter to commit')
            try:
                input()
                self.conn.commit()
            except KeyboardInterrupt:
                print()
                print('Rolling back')
                self.conn.rollback()
        else:
            print('No changes found')

        self.conn.close()

    def execute(self, query, **kwargs):
        self.cursor.execute(query, kwargs)
        return self.cursor.fetchall()

    @property
    def modified(self):
        return (
            self.new_artists or self.new_albums or
            self.new_tracks or self.modified_tracks or
            self.deleted_tracks
        )

    def print_changes(self):
        if self.new_artists:
            print('New artists:')
            print(tabulate(sorted(self.new_artists)))
            print()

        if self.new_albums:
            print('New albums:')
            print(tabulate(sorted(self.new_albums)))
            print()

        if self.new_tracks:
            print('New tracks:')
            print(tabulate(sorted(self.new_tracks)))
            print()

        if self.modified_tracks:
            print('Modified tracks:')
            print(tabulate(sorted(self.modified_tracks)))
            print()

        if self.deleted_tracks:
            print('Deleted tracks:')
            print(tabulate(sorted(self.deleted_tracks)))
            print()

    @functools.cache
    def get_artist_id(self, artist_name):
        artist_id_result = self.execute("""
            SELECT id FROM artist WHERE name = :name
        """, name=artist_name)

        if artist_id_result:
            return artist_id_result[0]['id']

        self.new_artists.append([artist_name])
        self.execute("""
            INSERT INTO artist (name) VALUES (:name)
        """, name=artist_name)

        return self.cursor.lastrowid

    @functools.cache
    def get_album_id(self, album_artist_name, album_title):
        album_artist_id = self.get_artist_id(album_artist_name)

        album_id_result = self.execute("""
            SELECT id FROM album WHERE title = $title AND artist_id = $artist_id
        """, title=album_title, artist_id=album_artist_id)

        if album_id_result:
            return album_id_result[0]['id']

        self.new_albums.append([album_artist_name, album_title])

        self.execute("""
            INSERT INTO album (title, artist_id) VALUES ($title, $artist_id)
        """, title=album_title, artist_id=album_artist_id)

        return self.cursor.lastrowid

    def add_track(self, path_relative_to_root, metadata):
        if metadata['album'] and metadata['album_artist'] is None:
            raise ValueError(f'No album artist for {path_relative_to_root}')

        artist_id = self.get_artist_id(metadata['artist'])
        album_artist_id = self.get_artist_id(metadata['album_artist'])

        if metadata['album']:
            album_id = self.get_album_id(metadata['album_artist'], metadata['album'])
        else:
            album_id = None

        self.new_tracks.append([
            metadata['artist'],
            metadata['album'],
            metadata['track_number'],
            metadata['title'],
            metadata['year'],
            metadata['genre'],
            path_relative_to_root,
        ])

        self.execute("""
            INSERT INTO track (
                title, artist_id, album_id, genre, duration,
                track_number, year, path, row_modified
            )
            VALUES (
                :title, :artist_id, :album_id, :genre, :duration,
                :track_number, :year, :path, :current_time
            )
        """,
            title=metadata['title'],
            artist_id=artist_id,
            album_id=album_id,
            genre=metadata['genre'],
            duration=metadata['duration'],
            track_number=metadata['track_number'],
            year=metadata['year'],
            path=path_relative_to_root,
            current_time=int(time.time()),
        )

    def update_track(self, existing_info, metadata):
        if metadata['album'] and metadata['album_artist'] is None:
            raise ValueError(f'No album artist for {path_relative_to_root}')

        existing_info_tuple = (
            existing_info['artist'],
            existing_info['album'],
            existing_info['track_number'],
            existing_info['title'],
            existing_info['year'],
            existing_info['genre'],
        )

        metadata_tuple = (
            metadata['artist'],
            metadata['album'],
            metadata['track_number'],
            metadata['title'],
            metadata['year'],
            metadata['genre'],
        )

        if existing_info_tuple == metadata_tuple:
            return

        artist_id = self.get_artist_id(metadata['artist'])

        if metadata['album']:
            album_id = self.get_album_id(metadata['album_artist'], metadata['album'])
        else:
            album_id = None

        self.modified_tracks.append([item or '' for item in metadata_tuple])

        self.execute("""
            UPDATE track
            SET title = :title, artist_id = :artist_id, album_id = :album_id,
                genre = :genre, track_number = :track_number, year = :year,
                row_modified = :current_time
            WHERE id = :id
        """,
            title=metadata['title'],
            artist_id=artist_id,
            album_id=album_id,
            genre=metadata['genre'],
            track_number=metadata['track_number'],
            year=metadata['year'],
            current_time=int(time.time()),
            id=existing_info['id'],
        )

    def delete_track(self, path_relative_to_root):
        self.deleted_tracks.append([path_relative_to_root])

        self.execute("""
            DELETE FROM track
            WHERE path = :path
        """, path=path_relative_to_root)

    def get_existing_tracks(self):
        track_result = self.execute("""
            SELECT * FROM track_view
        """)

        result = {}

        for track in track_result:
            result[track['path']] = track

        return result


def clean_garbage(path, metadata, field):
    value = getattr(metadata.tag, field)
    if value and '\ufeff' in value:
        setattr(metadata.tag, field, value.lstrip('\ufeff'))
        print('cleaning', field, path)

        if '--dry-run' not in sys.argv:
            metadata.tag.save()


def get_metadata(path):
    root = get_settings()['files']['base_stream_path']
    path_relative_to_root = str(path.relative_to(root))

    metadata = eyed3.load(path)

    clean_garbage(path, metadata, 'artist')
    clean_garbage(path, metadata, 'album_artist')
    clean_garbage(path, metadata, 'title')
    clean_garbage(path, metadata, 'album')

    return (
        path_relative_to_root, {
            'artist': metadata.tag.artist,
            'title': metadata.tag.title,
            'album': metadata.tag.album,
            'album_artist': metadata.tag.album_artist,
            'genre': metadata.tag.genre.name,
            'track_number': metadata.tag.track_num[0],
            'year': get_year(metadata),
            'duration': int(metadata.info.time_secs),
        }
    )


def get_all_metadata(root):
    paths = []

    for dirpath, _, filenames in os.walk(root):
        if '$New' in dirpath:
            continue

        for filename in filenames:
            full_path = pathlib.Path(dirpath) / filename

            if full_path.suffix != '.mp3':
                continue

            paths.append(full_path)

    with multiprocessing.Pool(8, init_logger) as pool:
        progress_bar = Bar('Scanning metadata', max=len(paths))

        return {
            path: metadata
            for path, metadata
            in progress_bar.iter(pool.imap(get_metadata, paths))
        }


def init_logger():
    logging.getLogger('eyed3').setLevel(logging.ERROR)


def main():
    root = get_settings()['files']['base_stream_path']
    all_metadata = get_all_metadata(root)

    db_path = get_settings()['files']['db_path']
    database = Database(db_path)

    with database:
        existing_tracks = database.get_existing_tracks()

        for path_relative_to_root, metadata in all_metadata.items():
            if path_relative_to_root in existing_tracks:
                # file exists in DB, check if it changed
                database.update_track(existing_tracks[path_relative_to_root], metadata)

                # note that the file exists
                del existing_tracks[path_relative_to_root]
            else:
                # file does not exist in DB, add it
                database.add_track(path_relative_to_root, metadata)

        for unfound_path in existing_tracks:
            database.delete_track(unfound_path)


if __name__ == '__main__':
    init_logger()

    main()
