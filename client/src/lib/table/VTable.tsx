import React from 'react';

import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Notice from 'lib/Notice';
import { observer } from 'mobx-react-lite';
import { ItemProps, TableComponents, TableVirtuoso } from 'react-virtuoso';
import { useStores } from 'stores';

import { calculateColumnWidths, renderValue } from './util';
import VTableCell from './VTableCell';
import VTableHeader from './VTableHeader';
import VTableRow from './VTableRow';
import VTableSizer from './VTableSizer';

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
  icons?: { [key: string]: React.ReactElement };
}

const VirtuosoTableComponents: TableComponents<RowData> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      // eslint-disable-next-line react/jsx-props-no-spreading
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
      // eslint-disable-next-line react/jsx-props-no-spreading
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
      // eslint-disable-next-line react/jsx-props-no-spreading
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

const VTable = <R extends RowData>({
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
}: Props<R>): React.ReactElement => {
  const { sortStoreMap } = useStores();
  const sortStore = sortStoreMap.get(id, rows, columns, initialSortSpecs);

  const [listHeight, setListHeight] = React.useState<number>(100);

  React.useEffect(() => {
    sortStore.setBaseRows(rows);
  }, [rows, rows.length]);

  const { sortedRows } = sortStore;
  const visibleRows = sortedRows.filter((row) => !hiddenRowIds.has(row.id));

  const columnWidths = calculateColumnWidths(sortedRows, columns);

  const EmptyPlaceholder = React.useCallback(() => (
    <Notice elevation={0}>{placeholderText}</Notice>
  ), [placeholderText]);

  const FillerRow = React.useCallback(({ height }: { height: number }) => (
    <div style={{ height }} />
  ), []);

  const TableRowComponent = React.useCallback((props: ItemProps<R>) => (
    <VTableRow
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onRowClick={onRowClick}
      onRowCtrlClick={onRowCtrlClick}
    />
  ), [onRowClick, onRowCtrlClick]);

  if (loading || rows.length !== sortedRows.length) {
    return (
      <Notice loading>Loading...</Notice>
    );
  }

  const fixedHeaderContent = showHeader
    ? () => (
      <TableRow component='div' sx={{ display: 'flex', width: '100%' }}>
        {columns.map((column) => (
          <VTableHeader
            key={String(column.key)}
            column={column}
            flexBasis={column.fixedWidth ? undefined : columnWidths[column.key]}
            sortStore={sortStore}
          />
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

  const handleListHeightChanged = (newHeight: number) => {
    setListHeight(newHeight);
  };

  return (
    <VTableSizer listHeight={listHeight} showHeader={showHeader} rowCount={visibleRows.length}>
      <TableVirtuoso
        data={visibleRows}
        components={{
          ...VirtuosoTableComponents,
          EmptyPlaceholder,
          FillerRow,
          TableRow: TableRowComponent,
        }}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
        totalListHeightChanged={handleListHeightChanged}
        fixedItemHeight={50}
      />
    </VTableSizer>
  );
};

export default observer(VTable);
