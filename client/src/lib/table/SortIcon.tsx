import React from 'react';
import PropTypes from 'prop-types';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

interface Props {
  sortingActive: boolean,
  sortOrder: 1 | -1,
  hover: boolean
}

export default class SortIcon extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const style = {
      transform: 'scale(.66)',
      transitionProperty: 'none',
      opacity: 1,
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
