import React from 'react';
import {observer} from 'mobx-react-lite';
import classNames from 'classnames';
import {
  TableCell,
  TableSortLabel,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {SortStore} from './SortStore';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

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
  sortStore: SortStore<R>;
}

function VTableHeader<R extends RowData>({
  column,
  headerHeight,
  sortStore,
}: Props<R>): React.ReactElement {
  const classes = useStyles();
  const topSortSpec = sortStore.topSortSpec;

  return (
    <TableCell
      component="div"
      className={classNames(classes.tableCell, classes.flexContainer)}
      onClick={() => sortStore.setSortColumnKey(column.key)}
      variant="head"
      style={{height: headerHeight, userSelect: 'none'}}
      align={column.align}
      size="small"
    >
      <TableSortLabel
        active={topSortSpec !== null && topSortSpec.columnKey === column.key}
        direction={topSortSpec !== null && topSortSpec.order === 1 ? 'desc' : 'asc'}
        IconComponent={KeyboardArrowUpIcon}
      >
        {column.label}
      </TableSortLabel>
    </TableCell>
  );
}

export default observer(VTableHeader);
