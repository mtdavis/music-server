import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {
  TableRow
} from '@material-ui/core';
import MTableRowColumn from './MTableRowColumn';

@observer
export default class MTableRow extends React.Component {
  render() {
    let {style} = this.props;
    const {columns, rowData, cursor, ...props} = this.props;
    delete props.style;
    delete props.mOnClick;

    const cells = columns.map(column =>
      <MTableRowColumn
        key={column.key}
        value={rowData[column.key]}
        mOnClick={this.mOnClick}
        renderer={column.renderer}
        textAlign={column.textAlign}
        wrap={column.wrap} />
    );

    style = style || {};
    style.cursor = cursor;

    return (
      <TableRow {...props} style={style}>
        {cells}
      </TableRow>
    );
  }

  mOnClick = (event) => {
    this.props.mOnClick(event, this.props.rowData);
  }
}

MTableRow.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    textAlign: PropTypes.oneOf(['left', 'right']),
    renderer: PropTypes.func,
    wrap: PropTypes.boolean
  })),

  rowData: PropTypes.object.isRequired,

  cursor: PropTypes.string,

  style: PropTypes.object,

  mOnClick: PropTypes.func,

  ...TableRow.propTypes
};
