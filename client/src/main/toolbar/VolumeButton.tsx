import React from 'react';

import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Popover, Slider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

import AppBarIconButton from './AppBarIconButton';

const VolumeButton = () => {
  const theme = useTheme();
  const { musicStore } = useStores();
  const buttonRef = React.useRef(null);

  const [volume, setVolume] = React.useState(0.5);
  const [volumePopoverVisible, setVolumePopoverVisible] = React.useState(false);

  let icon;
  if (volume < 0.01) {
    icon = VolumeMuteIcon;
  } else if (volume < 0.5) {
    icon = VolumeDownIcon;
  } else {
    icon = VolumeUpIcon;
  }

  const toggleVolumePopover = () => {
    setVolumePopoverVisible(!volumePopoverVisible);
  };

  const handleRequestClose = () => {
    setVolumePopoverVisible(false);
  };

  const onVolumeChange = (event: Event, newVolume: number | number[]) => {
    musicStore.setVolume(newVolume as number);
    setVolume(newVolume as number);
  };

  return (
    <>
      <div ref={buttonRef}>
        <AppBarIconButton
          Icon={icon}
          onClick={toggleVolumePopover}
        />
      </div>

      <Popover
        open={volumePopoverVisible}
        onClose={handleRequestClose}
        anchorEl={buttonRef.current}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <div
          style={{
            display: 'flex',
            height: 150,
            padding: `${theme.spacing(3)} ${theme.spacing(1)}`,
            overflow: 'hidden',
          }}
        >
          <Slider
            max={1}
            step={0.01}
            orientation='vertical'
            value={volume}
            onChange={onVolumeChange}
            size='small'
          />
        </div>
      </Popover>
    </>
  );
};

export default observer(VolumeButton);
