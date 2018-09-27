import React from 'react';
import PropTypes from 'prop-types';
import {TableCell} from '@material-ui/core';
import renderIcon from './renderIcon';

export default class MTableRowColumn extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {value, renderer, textAlign, wrap, style, mOnClick, ...props} = this.props;

    if(!renderer) {
      renderer = (x) => x;
    }

    if(!textAlign) {
      textAlign = 'left';
    }

    if(wrap === undefined) {
      wrap = true;
    }

    let content;

    if(!style) {
      style = {};
    }

    style.padding = 0;

    if(value !== null && value !== undefined) {
      content = renderer(value);

      if(renderer === renderIcon) {
        style.width = "48px";
      }
    }
    else {
      content = "-";
    }

    const divStyle = {
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      justifyContent: textAlign==='right' ? 'flex-end' : 'flex-start',
      whiteSpace: wrap ? 'normal' : 'nowrap',
      userSelect: 'none', // prevent double-click from selecting text
    };

    return (
      <TableCell {...props} style={style}>
        <div onClick={mOnClick} style={divStyle}>
          {content}
        </div>
      </TableCell>
    );
  }
}

MTableRowColumn.propTypes = {
  value: PropTypes.node,

  renderer: PropTypes.func,

  textAlign: PropTypes.oneOf(['left', 'right']),

  wrap: PropTypes.bool,

  style: PropTypes.object,

  mOnClick: PropTypes.func,

  ...TableCell.props
};
