import React from 'react';
import classNames from 'classnames';
import {
  TableCell,
  TableSortLabel,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box' as const,
  },
  tableCell: {
    flex: 1,
    fontSize: '0.8rem',
    lineHeight: 1.43,
  },
}));

interface Props<R extends RowData> {
  column: ColumnConfig<R>;
  headerHeight: number;
  topSortSpec: SortSpec<R> | null;
  setSortColumnKey: (key: keyof R) => void;
}

function VTableHeader<R extends RowData>({
  column,
  headerHeight,
  topSortSpec,
  setSortColumnKey,
}: Props<R>): React.ReactElement {
  const classes = useStyles();

  return (
    <TableCell
      component="div"
      className={classNames(classes.tableCell, classes.flexContainer)}
      onClick={() => setSortColumnKey(column.key)}
      variant="head"
      style={{height: headerHeight, userSelect: 'none'}}
      align={column.align}
      size="small"
    >
      <TableSortLabel
        active={topSortSpec !== null && topSortSpec.columnKey === column.key}
        direction={topSortSpec !== null && topSortSpec.order === 1 ? 'desc' : 'asc'}
      >
        {column.label}
      </TableSortLabel>
    </TableCell>
  );
}

export default VTableHeader;
