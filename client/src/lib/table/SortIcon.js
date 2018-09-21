import React from 'react';
import PropTypes from 'prop-types';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

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

SortIcon.propTypes = {
  sortingActive: PropTypes.bool,

  sortOrder: PropTypes.oneOf([1, -1]),

  hover: PropTypes.bool
};
