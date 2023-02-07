#!/usr/bin/env python

import json
import os
import pathlib
import sys

import eyed3

CONFIG_PATH = pathlib.Path(__file__).parent.parent / 'music-server-settings.json'
CONFIG = json.load(open(CONFIG_PATH))

if __name__ == '__main__':
    moves = []

    if len(sys.argv) != 2:
        print('usage: move_music.py SOURCE_DIR')
        sys.exit(1)

    target_dir = pathlib.Path(CONFIG['files']['base_stream_path'])

    for (dirpath, dirnames, filenames) in os.walk(sys.argv[1]):
        for filename in sorted(filenames):
            source_path = pathlib.Path(dirpath) / filename
            if source_path.suffix.lower() != '.mp3':
                continue

            metadata = eyed3.load(source_path)
            if metadata.tag.album_artist is None:
                print('no album artist: ', source_path)
                continue
            if metadata.tag.track_num[0] is None:
                print('no track number: ', source_path)
                continue
            if metadata.tag.title is None:
                print('no title: ', source_path)
                continue

            dest_path = target_dir / metadata.tag.album_artist / metadata.tag.album / f'{metadata.tag.track_num[0]}. {metadata.tag.title}.mp3'
            moves.append((source_path, dest_path))

    for (source_path, dest_path) in moves:
        print(f'{source_path} -> {dest_path}')

    input('Enter to confirm, ctrl+c to quit')

    for (source_path, dest_path) in moves:
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        source_path.rename(dest_path)


# find . -name *.mp3 -print0 | xargs -0 eyeD3 --track-total 0 --remove-all-comments --disc-num 0 --disc-total 0 --composer ''
