import React, {PropTypes} from 'react';
import {observer} from 'mobx-react';
import {
  TableRow
} from 'material-ui';
import deepEqual from 'deep-equal';
import MTableRowColumn from './MTableRowColumn';

@observer
export default class MTableRow extends React.Component {
  // TODO: remove this once we update material-ui
  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(this.props.columns, nextProps.columns) ||
      !deepEqual(this.props.rowData, nextProps.rowData) ||
      !deepEqual(this.props.displayBorder, nextProps.displayBorder);
  }

  render() {
    var {columns, rowData, cursor, style, mOnClick, ...props} = this.props;

    var cells = columns.map(column =>
      <MTableRowColumn
        key={column.key}
        value={rowData[column.key]}
        mOnClick={this.mOnClick.bind(this)}
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
    )
  }

  mOnClick(event) {
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
