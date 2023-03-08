import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  TableCell,
  TableSortLabel,
} from '@mui/material';
import {SortStore} from './SortStore';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
  const {topSortSpec} = sortStore;

  return (
    <TableCell
      component="div"
      variant="head"
      sx={{
        alignItems: 'center',
        backgroundColor: 'background.paper',
        boxSizing: 'border-box' as const,
        display: 'flex',
        flexBasis,
        flexGrow: column.fixedWidth ? 0 : 1,
        flexShrink: column.fixedWidth ? 0 : 1,
        fontSize: '0.8rem',
        lineHeight: 1.43,
        maxHeight: 50,
        userSelect: 'none',
        width: column.fixedWidth,
      }}
      align={column.align}
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
