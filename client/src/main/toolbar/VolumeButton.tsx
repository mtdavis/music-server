import React from 'react';
import {observer} from 'mobx-react-lite';
import {Slider} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {Theme} from '@material-ui/core/styles';
const popoverPromise = import('@material-ui/core/Popover');
import VolumeMuteIcon from '@material-ui/icons/VolumeMute';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import AppBarIconButton from './AppBarIconButton';
import {useStores} from 'stores';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: 150,
    padding: `${theme.spacing(3)}px ${theme.spacing(1)}px`,
    overflow: 'hidden',
  },
}));

const VolumeButton = () => {
  const Popover = React.lazy(() => popoverPromise);
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

  const onVolumeChange = (event: React.ChangeEvent<unknown>, newVolume: number | number[]) => {
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

      <React.Suspense fallback={<div />}>
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
            />
          </div>
        </Popover>
      </React.Suspense>
    </>
  );
};

export default observer(VolumeButton);
