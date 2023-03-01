import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {TableComponents, TableVirtuoso} from 'react-virtuoso';

import VTablePaper from './VTablePaper';
import VTableCell, {renderValue} from './VTableCell';
import VTableRow from './VTableRow';
// import VTableHeader from './VTableHeader';
import Notice from 'lib/Notice';
import {calculateColumnWidths} from './util';
import {useStores} from 'stores';

export interface Props<R extends RowData> {
  id: string;
  columns: ColumnConfig<R>[];
  rows: R[];
  hiddenRowIds?: Set<number>;
  loading?: boolean;
  showHeader?: boolean;
  onRowClick?: (row: R) => void;
  onRowCtrlClick?: (row: R) => void;
  placeholderText: string;
  initialSortSpecs?: SortSpec<R>[];
  icons?: {[key: string]: React.ReactElement};
}

const VirtuosoTableComponents: TableComponents<RowData> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      component='div'
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    />
  ),
  TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead
      {...props}
      ref={ref}
      component='div'
      sx={{
        display: 'flex',
        width: '100%',
      }}
    />
  )),
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody
      {...props}
      ref={ref}
      component='div'
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    />
  )),
};

function VTable<R extends RowData>({
  id,
  columns,
  rows,
  hiddenRowIds = new Set<number>(),
  loading = false,
  showHeader = true,
  onRowClick = () => {},
  onRowCtrlClick = () => {},
  placeholderText,
  initialSortSpecs = [],
  icons = {},
}: Props<R>): React.ReactElement {
  const {sortStoreMap} = useStores();
  const sortStore = sortStoreMap.get(id, rows, columns, initialSortSpecs);

  React.useEffect(() => {
    sortStore.setBaseRows(rows);
  }, [rows, rows.length]);

  const sortedRows = sortStore.sortedRows;
  const visibleRows = sortedRows.filter(row => !hiddenRowIds.has(row.id));

  const columnWidths = calculateColumnWidths(sortedRows, columns);

  if(loading || rows.length !== sortedRows.length) {
    return (
      <Notice loading>Loading...</Notice>
    );
  }

  const fixedHeaderContent = showHeader ?
    () => (
      <TableRow component='div' sx={{display: 'flex', width: '100%'}}>
        {columns.map((column) => (
          <VTableCell
            key={String(column.key)}
            column={column}
            flexBasis={column.fixedWidth ? undefined : columnWidths[column.key]}
            variant='head'
          >
            {column.label}
          </VTableCell>
        ))}
      </TableRow>
    ) : null;

  const rowContent = (_index: number, rowData: R) => (
    columns.map((column) => (
      <VTableCell
        key={String(column.key)}
        column={column}
        flexBasis={column.fixedWidth ? undefined : columnWidths[column.key]}
      >
        {renderValue(rowData[column.key], rowData, column, icons)}
      </VTableCell>
    ))
  );

  return (
    <VTablePaper>
      <TableVirtuoso
        data={visibleRows}
        components={{
          ...VirtuosoTableComponents,
          EmptyPlaceholder: () => (
            <Notice elevation={0}>{placeholderText}</Notice>
          ),
          FillerRow: ({height}) => <div style={{height}} />,
          TableRow: (props) => (
            <VTableRow
              {...props}
              onRowClick={onRowClick}
              onRowCtrlClick={onRowCtrlClick}
            />
          ),
        }}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </VTablePaper>
  );
}

export default observer(VTable);
