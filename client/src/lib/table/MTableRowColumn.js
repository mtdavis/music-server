import React from 'react';
import {
  FontIcon,
  TableRowColumn
} from 'material-ui';

export default class MTableRowColumn extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var {value, renderer, textAlign, wrap, style, mOnClick, ...props} = this.props;

    if(!renderer) {
      renderer = (x) => x;
    }

    if(!textAlign) {
      textAlign = 'left';
    }

    if(wrap === undefined) {
      wrap = true;
    }

    var content;
    style.padding = 0;

    if(renderer === "icon") {
      content = <FontIcon className={value} />;
      style.width = "48px";
    }
    else if(value !== null && value !== undefined) {
      content = renderer(value);
    }
    else {
      content = "-";
    }

    var divStyle = {
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      justifyContent: textAlign==='right' ? 'flex-end' : 'flex-start',
      whiteSpace: wrap ? 'normal' : 'nowrap',
      userSelect: 'none', //prevent double-click from selecting text
    };

    return (
      <TableRowColumn {...props} style={style}>
        <div onClick={mOnClick} style={divStyle}>
          {content}
        </div>
      </TableRowColumn>
    );
  }
}
