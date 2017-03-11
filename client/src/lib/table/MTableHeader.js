import React from 'react';
import {
  TableHeader,
  TableRow
} from 'material-ui';
import MTableHeaderColumn from './MTableHeaderColumn';

class MTableHeader extends React.Component {
  render() {
    var {columns, sortColumnKey, sortOrder, setSortColumnKey, ...props} = this.props;

    var cells = columns.map(column =>
      <MTableHeaderColumn
        key={column.key}
        column={column}
        sortingActive={column.key===sortColumnKey}
        sortOrder={sortOrder}
        setSortColumnKey={setSortColumnKey}
      />
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
