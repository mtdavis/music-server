import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Popover} from '@material-ui/core';
import {Slider} from '@material-ui/lab';
import AppBarIconButton from './AppBarIconButton';
import VolumeMuteIcon from '@material-ui/icons/VolumeMute';
import VolumeDownIcon from '@material-ui/icons/VolumeDown';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

@inject('musicStore')
@observer
export default class VolumeButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      volume: .5,
      volumePopoverVisible: false
    };
  }

  render() {
    let icon;
    if(this.state.volume < .01) {
      icon = <VolumeMuteIcon />;
    }
    else if(this.state.volume < .5) {
      icon = <VolumeDownIcon />;
    }
    else {
      icon = <VolumeUpIcon />;
    }

    return (
      <div>
        <div ref='button'>
          <AppBarIconButton
            icon={icon}
            onClick={this.toggleVolumePopover} />
        </div>

        <Popover
          open={this.state.volumePopoverVisible}
          onClose={this.handleRequestClose}
          anchorEl={this.refs.button}
          transformOrigin={{horizontal:'center', vertical:'top'}}
          anchorOrigin={{horizontal:"center", vertical:"bottom"}}
          style={{zDepth: 2}}>
          <Slider
            style={{height: 148, padding: 24}}
            max={1}
            step={.01}
            vertical={true}
            reverse={true}
            value={this.state.volume}
            onChange={this.onVolumeChange} />
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

  onVolumeChange = (event, newVolume) => {
    this.props.musicStore.setVolume(newVolume);
    this.setState({
      volume: newVolume
    });
  }
}
