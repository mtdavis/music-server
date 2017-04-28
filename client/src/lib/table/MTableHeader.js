import React, {PropTypes} from 'react';
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

MTableHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired
  })).isRequired,

  sortColumnKey: PropTypes.string.isRequired,

  sortOrder: PropTypes.oneOf([1, -1]).isRequired,

  setSortColumnKey: PropTypes.func.isRequired,

  ...TableHeader.propTypes
}

export default MTableHeader;
