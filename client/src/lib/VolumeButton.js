import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {
  Popover,
  Slider
} from 'material-ui';
import {PopoverAnimationVertical} from 'material-ui/Popover';
import AppBarIconButton from './AppBarIconButton';

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
    let iconClassName;
    if(this.state.volume < .01) {
      iconClassName = "icon-volume-mute";
    }
    else if(this.state.volume < .33) {
      iconClassName = "icon-volume-low";
    }
    else if(this.state.volume < .67) {
      iconClassName = "icon-volume-medium";
    }
    else {
      iconClassName = "icon-volume-high";
    }

    return (
      <div>
        <div ref='button'>
          <AppBarIconButton
            iconClassName={iconClassName}
            onClick={this.toggleVolumePopover} />
        </div>

        <Popover
          open={this.state.volumePopoverVisible}
          onRequestClose={this.handleRequestClose}
          anchorEl={this.refs.button}
          animation={PopoverAnimationVertical}
          anchorOrigin={{horizontal:"middle", vertical:"bottom"}}
          targetOrigin={{horizontal:"middle", vertical:"top"}}
          style={{transformOrigin: 'center top'}}
          zDepth={2}>
          <Slider
            style={{height: 100, margin: '24px 12px'}}
            axis='y'
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
