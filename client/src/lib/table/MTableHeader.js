import React from 'react';
import PropTypes from 'prop-types';
import {
  TableHead,
  TableRow
} from '@material-ui/core';
import MTableHeaderColumn from './MTableHeaderColumn';

class MTableHeader extends React.Component {
  render() {
    const {columns, sortColumnKey, sortOrder, setSortColumnKey, ...props} = this.props;

    const cells = columns.map(column =>
      <MTableHeaderColumn
        key={column.key}
        column={column}
        sortingActive={column.key===sortColumnKey}
        sortOrder={sortOrder}
        setSortColumnKey={setSortColumnKey}
      />
    );

    return (
      <TableHead {...props}>
        <TableRow>
          {cells}
        </TableRow>
      </TableHead>
    );
  }
}

MTableHeader.muiName = 'TableHead';

MTableHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired
  })).isRequired,

  sortColumnKey: PropTypes.string.isRequired,

  sortOrder: PropTypes.oneOf([1, -1]).isRequired,

  setSortColumnKey: PropTypes.func.isRequired,

  ...TableHead.propTypes
};

export default MTableHeader;
