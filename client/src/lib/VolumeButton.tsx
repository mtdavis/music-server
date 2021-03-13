import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Popover} from '@material-ui/core';
import {
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import {Slider} from '@material-ui/lab';
import VolumeMuteIcon from '@material-ui/icons/VolumeMute';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

import AppBarIconButton from './AppBarIconButton';
import {MusicStore} from '../stores';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
    height: 150,
    padding: theme.spacing.unit * 3,
    overflow: 'hidden',
  },
});

interface Props extends WithStyles<typeof styles> {
}

interface InjectedProps extends Props {
  musicStore: MusicStore,
}

interface State {
  volume: number,
  volumePopoverVisible: boolean,
}

@inject('musicStore')
@observer
class VolumeButton extends Component<Props, State> {
  private _buttonRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      volume: .5,
      volumePopoverVisible: false
    };
  }

  get injected() {
    return this.props as InjectedProps;
  }

  render() {
    const {classes} = this.props;

    let icon;
    if(this.state.volume < .01) {
      icon = VolumeMuteIcon;
    }
    else if(this.state.volume < .5) {
      icon = VolumeDownIcon;
    }
    else {
      icon = VolumeUpIcon;
    }

    return (
      <div>
        <div ref={this._buttonRef}>
          <AppBarIconButton
            Icon={icon}
            onClick={this.toggleVolumePopover} />
        </div>

        <Popover
          open={this.state.volumePopoverVisible}
          onClose={this.handleRequestClose}
          anchorEl={this._buttonRef.current}
          transformOrigin={{horizontal:'center', vertical:'top'}}
          anchorOrigin={{horizontal:"center", vertical:"bottom"}}
        >
          <div className={classes.root}>
            <Slider
              max={1}
              step={.01}
              vertical
              value={this.state.volume}
              onChange={this.onVolumeChange}
            />
          </div>
        </Popover>
      </div>
    );
  }

  toggleVolumePopover = () => {
    this.setState({
      volumePopoverVisible: !this.state.volumePopoverVisible
    });
  }

  handleRequestClose = () => {
    this.setState({
      volumePopoverVisible: false
    });
  }

  onVolumeChange = (event: React.ChangeEvent<{}>, newVolume: number) => {
    this.injected.musicStore.setVolume(newVolume);
    this.setState({
      volume: newVolume
    });
  }
}

export default withStyles(styles)(VolumeButton);
