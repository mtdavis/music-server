import React from 'react';
import {
  TableHeader,
  TableHeaderColumn,
  TableRow
} from 'material-ui';
import deepEqual from 'deep-equal';
import MTableRowColumn from './MTableRowColumn';

class MTableHeader extends React.Component {
  render() {
    var {columns, setSortColumnKey, ...props} = this.props;

    var cells = columns.map(column =>
      <TableHeaderColumn key={column.key} style={{
          padding: 0
        }}>
        <div onClick={() => setSortColumnKey(column.key)} style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            cursor: 'pointer',
            justifyContent: column.textAlign==='right' ? 'flex-end' : 'flex-start',
          }}>
          {column.header}
        </div>
      </TableHeaderColumn>
    );

    return (
      <TableHeader {...props} displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          {cells}
        </TableRow>
      </TableHeader>
    );
  }
}

MTableHeader.muiName = 'TableHeader';

export default MTableHeader;
