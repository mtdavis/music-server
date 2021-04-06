import React from 'react';
import classNames from 'classnames';
import {toJS} from 'mobx';
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
import {calculateColumnWidths, renderIcon, sortBySpecs} from './util';

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
  columns: ColumnConfig<R>[];
  rows: R[];
  headerHeight?: number;
  rowHeight?: number;
  loading?: boolean;
  showHeader?: boolean;
  onRowClick?: (row: R) => void;
  onRowCtrlClick?: (row: R) => void;
  placeholderText: string;
  initialSortSpecs?: SortSpec<R>[],
  icons?: {[key: string]: React.ReactElement},
}

function VTable<R extends RowData>({
  columns,
  rows,
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
  const [sortSpecs, setSortSpecs] = React.useState<SortSpec<R>[]>(initialSortSpecs);

  const sortedRows = sortBySpecs(toJS(rows), sortSpecs);

  const columnWidths = calculateColumnWidths(toJS(rows), columns);

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

  const setSortColumnKey = (newSortColumnKey: keyof R) => {
    const newSortSpecs = sortSpecs.slice();

    // check if newSortColumnKey is already in sortSpecs
    const existingIndex = newSortSpecs.findIndex(
      spec => spec.columnKey === newSortColumnKey);

    if(existingIndex === -1) {
      // does not exist, so add it to the top position.
      newSortSpecs.push({
        columnKey: newSortColumnKey,
        order: 1,
      });
    }
    else if(existingIndex === newSortSpecs.length - 1) {
      // exists in top position, so flip its order.
      const sortSpec = Object.assign({}, newSortSpecs[existingIndex]);
      newSortSpecs.splice(existingIndex, 1);

      sortSpec.order = -sortSpec.order as SortOrder;
      newSortSpecs.push(sortSpec);
    }
    else {
      // exists in some other position,
      // so remove it and re-add to the top position.
      newSortSpecs.splice(existingIndex, 1);

      newSortSpecs.push({
        columnKey: newSortColumnKey,
        order: 1,
      });
    }

    setSortSpecs(newSortSpecs);
  };

  const getTopSortSpec = () => {
    if(sortSpecs.length === 0) {
      return null;
    }

    return sortSpecs[sortSpecs.length - 1];
  };

  const renderColumn = (column: ColumnConfig<R>) => {
    const headerRenderer = showHeader ? (() => (
      <VTableHeader<R>
        column={column}
        headerHeight={headerHeight}
        topSortSpec={getTopSortSpec()}
        setSortColumnKey={setSortColumnKey}
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

  if(loading) {
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
    <VTablePaper rowCount={sortedRows.length} showHeader={showHeader} rowHeight={rowHeight} headerHeight={headerHeight}>
      {autoSizerProps =>
        <Table
          {...autoSizerProps}
          className={classes.table}
          rowCount={sortedRows.length}
          rowGetter={({index}) => sortedRows[index]}
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

export default VTable;
