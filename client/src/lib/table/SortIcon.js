import React from 'react';
import ArrowUpwardIcon from 'material-ui/svg-icons/navigation/arrow-upward';
import ArrowDownwardIcon from 'material-ui/svg-icons/navigation/arrow-downward';

export default class SortIcon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let style = {
      transform: 'scale(.66)',
      transitionProperty: 'none',
    };

    let Icon;

    if(this.props.sortingActive) {
      if(this.props.sortOrder < 0) {
        Icon = ArrowUpwardIcon;
      }
      else {
        Icon = ArrowDownwardIcon;
      }
    }
    else {
      Icon = ArrowDownwardIcon;
      style.opacity = this.props.hover ? .38 : 0;
    }

    return (
      <Icon style={style} />
    );
  }
}