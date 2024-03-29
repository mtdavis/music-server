import React from 'react';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  TableCell,
  TableSortLabel,
} from '@mui/material';
import { observer } from 'mobx-react-lite';

import { SortStore } from './SortStore';

interface Props<R extends RowData> {
  column: ColumnConfig<R>;
  flexBasis?: number,
  sortStore: SortStore<R>;
}

const VTableHeader = <R extends RowData>({
  column,
  flexBasis,
  sortStore,
}: Props<R>): React.ReactElement => {
  const { topSortSpec } = sortStore;

  return (
    <TableCell
      component='div'
      variant='head'
      sx={{
        alignItems: 'center',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexBasis: `${flexBasis}%`,
        flexGrow: column.fixedWidth ? 0 : 1,
        flexShrink: column.fixedWidth ? 0 : 1,
        fontSize: '0.8rem',
        height: 50,
        lineHeight: 1.43,
        paddingBottom: 0,
        paddingTop: 0,
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
};

export default observer(VTableHeader);
