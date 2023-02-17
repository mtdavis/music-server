import React from 'react';
import {observer} from 'mobx-react-lite';
import MusicCircleIcon from 'mdi-material-ui/MusicCircleOutline';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import StopCircle from 'mdi-material-ui/StopCircle';

import VTable from './table/VTable';
import {renderIcon} from './table/util';
import PlayerState from './PlayerState';
import {secondsToTimeString} from './util';
import {useStores} from 'stores';

interface PlaylistItem extends RowData {
  icon: string;
  text: string;
  duration: number;
}

const COLUMNS = [
  {
    key: 'icon',
    renderer: renderIcon,
    maxWidth: 48,
  },
  {
    key: 'text',
  },
  {
    key: 'duration',
    renderer: secondsToTimeString,
    align: 'right' as const,
  }
];

const Playlist = () => {
  const {musicStore} = useStores();

  // check whether all artists are equal.
  let allArtistsEqual = true;
  let artist = null;
  for(let i = 0; i < musicStore.playlist.length; i++) {
    if(artist === null) {
      artist = musicStore.playlist[i].artist;
    }
    else if(artist !== musicStore.playlist[i].artist) {
      allArtistsEqual = false;
    }
  }

  const playlistItems = musicStore.playlist.map(function(track, index) {
    const icon = track === musicStore.currentTrack ? musicStore.playerState : 'default';

    const text = allArtistsEqual ?
      `${index + 1}. ${track.title}` :
      `${index + 1}. ${track.artist} - ${track.title}`;

    return {
      id: index,
      icon: icon,
      text: text,
      duration: track.duration
    };
  });

  const icons = {
    default: <MusicCircleIcon />,
    [PlayerState.PLAYING]: <PlayCircleFilledIcon color='secondary' />,
    [PlayerState.PAUSED]: <PauseCircleFilledIcon color='primary' />,
    [PlayerState.STOPPED]: <StopCircle color='primary' />,
  };

  const onTrackClick = (item: PlaylistItem): void => {
    musicStore.jumpToPlaylistItem(item.id);
  };

  return (
    <VTable<PlaylistItem>
      id='playlist'
      rows={playlistItems}
      showHeader={false}
      columns={COLUMNS}
      onRowClick={onTrackClick}
      placeholderText='The playlist is empty!'
      icons={icons}
    />
  );
};

export default observer(Playlist);
