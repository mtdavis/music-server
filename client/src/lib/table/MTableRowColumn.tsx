import React from 'react';
import PropTypes from 'prop-types';
import TableCell, {TableCellProps} from '@material-ui/core/TableCell';
import renderIcon from './renderIcon';

interface Props extends TableCellProps {
  value: any,

  renderer: (value: any) => any,

  textAlign: 'left' | 'right',

  wrap: boolean,

  style: React.CSSProperties,

  mOnClick: (evt: React.SyntheticEvent) => void,
};

export default class MTableRowColumn extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    let {value, renderer, textAlign, wrap, style, mOnClick, ...props} = this.props;

    if(!renderer) {
      renderer = (x: any) => x;
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
    style.userSelect = 'none';

    if(value !== null && value !== undefined) {
      content = renderer(value);

      if(renderer === renderIcon) {
        style.width = "48px";
      }
    }
    else {
      content = "-";
    }

    const divStyle: React.CSSProperties = {
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      justifyContent: textAlign==='right' ? 'flex-end' : 'flex-start',
      whiteSpace: wrap ? 'normal' : 'nowrap',
      userSelect: 'none', // prevent double-click from selecting text
    };

    return (
      <TableCell {...props} style={style} onClick={mOnClick}>
        <div style={divStyle}>
          {content}
        </div>
      </TableCell>
    );
  }
}
