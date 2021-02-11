import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import TableRow, {TableRowProps} from '@material-ui/core/TableRow';
import MTableRowColumn from './MTableRowColumn';

interface Column {
  key: string,

  textAlign: 'left' | 'right',

  renderer: (value: any) => any,

  wrap: boolean,
};

interface Props extends TableRowProps {
  columns: Array<Column>,

  rowData: RowData,

  cursor: string,

  style?: React.CSSProperties,

  mOnClick: (evt: React.SyntheticEvent, data: RowData) => void,
};

@observer
export default class MTableRow extends React.Component<Props> {
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

  mOnClick = (event: React.SyntheticEvent) => {
    this.props.mOnClick(event, this.props.rowData);
  }
}
