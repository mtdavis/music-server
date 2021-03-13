import React from 'react';
import classNames from 'classnames';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

const styles = () => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box' as 'border-box',
  },
  tableCell: {
    flex: 1,
  },
});

interface Props extends WithStyles<typeof styles> {
  column: ColumnConfig;
  headerHeight: number;
  topSortSpec: SortSpec | null;
  setSortColumnKey: (key: string) => void;
}

class VTableHeader extends React.Component<Props> {
  render() {
    const {column, headerHeight, topSortSpec, setSortColumnKey, classes} = this.props;

    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer)}
        onClick={() => setSortColumnKey(column.key)}
        variant="head"
        style={{height: headerHeight, userSelect: 'none'}}
        align={column.align}
      >
        <TableSortLabel
          active={topSortSpec !== null  && topSortSpec.columnKey === column.key}
          direction={topSortSpec !== null && topSortSpec.order === 1 ? 'desc' : 'asc'}
        >
          {column.label}
        </TableSortLabel>
      </TableCell>
    );
  }
}

export default withStyles(styles)(VTableHeader);
