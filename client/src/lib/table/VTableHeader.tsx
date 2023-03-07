import React from 'react';
import {observer} from 'mobx-react-lite';
import classNames from 'classnames';
import {
  TableCell,
  TableSortLabel,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {SortStore} from './SortStore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const useStyles = makeStyles(() => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box' as const,
  },
  tableCell: {
    fontSize: '0.8rem',
    lineHeight: 1.43,
  },
}));

interface Props<R extends RowData> {
  column: ColumnConfig<R>;
  flexBasis?: string | number,
  sortStore: SortStore<R>;
}

function VTableHeader<R extends RowData>({
  column,
  flexBasis,
  sortStore,
}: Props<R>): React.ReactElement {
  const classes = useStyles();
  const topSortSpec = sortStore.topSortSpec;

  return (
    <TableCell
      component="div"
      className={classNames(classes.tableCell, classes.flexContainer)}
      variant="head"
      sx={{
        backgroundColor: 'background.paper',
        flexBasis,
        flexGrow: column.fixedWidth ? 0 : 1,
        flexShrink: column.fixedWidth ? 0 : 1,
        userSelect: 'none',
        width: column.fixedWidth,
      }}
      align={column.align}
      size='small'
    >
      <TableSortLabel
        active={topSortSpec !== null && topSortSpec.columnKey === column.key}
        direction={topSortSpec !== null && topSortSpec.order === 1 ? 'desc' : 'asc'}
        IconComponent={KeyboardArrowUpIcon}
        onClick={() => sortStore.setSortColumnKey(column.key)}
      >
        {column.label}
      </TableSortLabel>
    </TableCell>
  );
}

export default observer(VTableHeader);
