import React from 'react';
import classNames from 'classnames';
import {observer} from 'mobx-react-lite';
import {Theme} from '@material-ui/core/styles';
import {makeStyles} from '@material-ui/styles';
import {
  Column,
  Table,
  RowMouseEventHandlerParams,
  TableCellProps,
} from 'react-virtualized';

import VTablePaper from './VTablePaper';
import VTableCell from './VTableCell';
import VTableHeader from './VTableHeader';
import Notice from 'lib/Notice';
import {calculateColumnWidths, renderIcon} from './util';
import {useStores} from 'stores';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    fontFamily: theme.typography.fontFamily,
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box' as const,
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
}));

export interface Props<R extends RowData> {
  id: string;
  columns: ColumnConfig<R>[];
  rows: R[];
  hiddenRowIds?: Set<number>;
  headerHeight?: number;
  rowHeight?: number;
  loading?: boolean;
  showHeader?: boolean;
  onRowClick?: (row: R) => void;
  onRowCtrlClick?: (row: R) => void;
  placeholderText: string;
  initialSortSpecs?: SortSpec<R>[];
  icons?: {[key: string]: React.ReactElement};
}

function VTable<R extends RowData>({
  id,
  columns,
  rows,
  hiddenRowIds = new Set<number>(),
  headerHeight = 48,
  rowHeight = 48,
  loading = false,
  showHeader = true,
  onRowClick = () => {},
  onRowCtrlClick = () => {},
  placeholderText,
  initialSortSpecs = [],
  icons = {},
}: Props<R>): React.ReactElement {
  const classes = useStyles();

  const {sortStoreMap} = useStores();
  const sortStore = sortStoreMap.get(id, rows, columns, initialSortSpecs);

  React.useEffect(() => {
    sortStore.setBaseRows(rows);
  }, [rows, rows.length]);

  const sortedRows = sortStore.sortedRows;
  const visibleRows = sortedRows.filter(row => !hiddenRowIds.has(row.id));

  const columnWidths = calculateColumnWidths(sortedRows, columns);

  const getRowClassName = ({
    index
  }: {index: number}) => (
    classNames(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick,
    })
  );

  const _onRowClick = ({
    event,
    rowData,
  }: RowMouseEventHandlerParams) => {
    if((event.ctrlKey || event.metaKey) && onRowCtrlClick) {
      event.preventDefault();
      onRowCtrlClick(rowData);
    }
    else if(onRowClick) {
      onRowClick(rowData);
    }
  };

  const renderColumn = (column: ColumnConfig<R>) => {
    const headerRenderer = showHeader ? (() => (
      <VTableHeader<R>
        column={column}
        headerHeight={headerHeight}
        sortStore={sortStore}
      />
    )) : undefined;

    const cellRenderer = ({cellData}: TableCellProps) => (
      <VTableCell<R>
        value={cellData}
        column={column}
        rowHeight={rowHeight}
        icons={icons}
      />
    );

    const width = Math.sqrt(columnWidths[column.key]);

    return (
      <Column
        key={column.key as string}
        dataKey={column.key as string}

        className={classes.flexContainer}

        headerRenderer={headerRenderer}

        cellRenderer={cellRenderer}

        flexGrow={width}
        flexShrink={width}
        width={width}
        maxWidth={column.renderer === renderIcon ? 48 : undefined}
      />
    );
  };

  if(loading || rows.length !== sortedRows.length) {
    return (
      <Notice loading>Loading...</Notice>
    );
  }

  if(rows.length === 0 && placeholderText) {
    return (
      <Notice>{placeholderText}</Notice>
    );
  }

  return (
    <VTablePaper
      rowCount={visibleRows.length}
      showHeader={showHeader}
      rowHeight={rowHeight}
      headerHeight={headerHeight}
    >
      {autoSizerProps =>
        <Table
          {...autoSizerProps}
          className={classes.table}
          rowCount={visibleRows.length}
          rowGetter={({index}) => visibleRows[index]}
          rowHeight={rowHeight}
          headerHeight={showHeader ? headerHeight : 0}
          onRowClick={_onRowClick}
          rowClassName={getRowClassName}
        >
          {columns.map(renderColumn)}
        </Table>
      }
    </VTablePaper>
  );
}

export default observer(VTable);
