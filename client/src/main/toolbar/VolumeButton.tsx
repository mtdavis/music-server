import React from 'react';
import {observer} from 'mobx-react-lite';
import {Popover, Slider} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {Theme} from '@mui/material/styles';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import AppBarIconButton from './AppBarIconButton';
import {useStores} from 'stores';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: 150,
    padding: `${theme.spacing(3)} ${theme.spacing(1)}`,
    overflow: 'hidden',
  },
}));

const VolumeButton = () => {
  const classes = useStyles();
  const {musicStore} = useStores();
  const buttonRef = React.useRef(null);

  const [volume, setVolume] = React.useState(.5);
  const [volumePopoverVisible, setVolumePopoverVisible] = React.useState(false);

  let icon;
  if(volume < .01) {
    icon = VolumeMuteIcon;
  }
  else if(volume < .5) {
    icon = VolumeDownIcon;
  }
  else {
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
          onClick={toggleVolumePopover} />
      </div>

      <Popover
        open={volumePopoverVisible}
        onClose={handleRequestClose}
        anchorEl={buttonRef.current}
        transformOrigin={{horizontal: 'center', vertical: 'top'}}
        anchorOrigin={{horizontal: 'center', vertical: 'bottom'}}
      >
        <div className={classes.root}>
          <Slider
            max={1}
            step={.01}
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
