import React from 'react';
// import classNames from 'classnames';
import {observer} from 'mobx-react-lite';
// import {Theme} from '@mui/material/styles';
// import {makeStyles} from '@mui/styles';
// import {
//   Column,
//   Table,
//   RowMouseEventHandlerParams,
//   TableCellProps,
// } from 'react-virtualized';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {TableComponents, TableVirtuoso} from 'react-virtuoso';

// import VTablePaper from './VTablePaper';
// import VTableCell from './VTableCell';
// import VTableHeader from './VTableHeader';
import Notice from 'lib/Notice';
import {calculateColumnWidths} from './util';
import {useStores} from 'stores';

// const useStyles = makeStyles((theme: Theme) => ({
//   table: {
//     fontFamily: theme.typography.fontFamily,
//   },
//   flexContainer: {
//     display: 'flex',
//     alignItems: 'center',
//     boxSizing: 'border-box' as const,
//   },
//   tableRow: {
//     cursor: 'pointer',
//   },
//   tableRowHover: {
//     '&:hover': {
//       backgroundColor: theme.palette.grey[200],
//     },
//   },
// }));

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

const VirtuosoTableComponents: TableComponents<Data> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{borderCollapse: 'separate', tableLayout: 'auto'}} />
  ),
  TableHead,
  TableRow: ({item: _item, ...props}) => <TableRow {...props} />,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

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
  // const classes = useStyles();

  const {sortStoreMap} = useStores();
  const sortStore = sortStoreMap.get(id, rows, columns, initialSortSpecs);

  React.useEffect(() => {
    sortStore.setBaseRows(rows);
  }, [rows, rows.length]);

  const sortedRows = sortStore.sortedRows;
  const visibleRows = sortedRows.filter(row => !hiddenRowIds.has(row.id));

  const columnWidths = calculateColumnWidths(sortedRows, columns);

  // const getRowClassName = ({
  //   index
  // }: {index: number}) => (
  //   classNames(classes.tableRow, classes.flexContainer, {
  //     [classes.tableRowHover]: index !== -1 && onRowClick,
  //   })
  // );

  // const _onRowClick = ({
  //   event,
  //   rowData,
  // }: RowMouseEventHandlerParams) => {
  //   if((event.ctrlKey || event.metaKey) && onRowCtrlClick) {
  //     event.preventDefault();
  //     onRowCtrlClick(rowData);
  //   }
  //   else if(onRowClick) {
  //     onRowClick(rowData);
  //   }
  // };

  // const renderColumn = (column: ColumnConfig<R>) => {
  //   const headerRenderer = showHeader ? (() => (
  //     <VTableHeader<R>
  //       column={column}
  //       headerHeight={headerHeight}
  //       sortStore={sortStore}
  //     />
  //   )) : undefined;

  //   const cellRenderer = ({
  //     cellData,
  //     rowData,
  //   }: TableCellProps) => (
  //     <VTableCell<R>
  //       value={cellData}
  //       rowData={rowData}
  //       column={column}
  //       rowHeight={rowHeight}
  //       icons={icons}
  //     />
  //   );

  //   const width = Math.sqrt(columnWidths[column.key]);

  //   return (
  //     <Column
  //       key={column.key as string}
  //       dataKey={column.key as string}

  //       className={classes.flexContainer}

  //       headerRenderer={headerRenderer}

  //       cellRenderer={cellRenderer}

  //       flexGrow={width}
  //       flexShrink={width}
  //       width={width}
  //       maxWidth={column.maxWidth}
  //     />
  //   );
  // };

  if(loading || rows.length !== sortedRows.length) {
    return (
      <Notice loading>Loading...</Notice>
    );
  }

  if(visibleRows.length === 0 && placeholderText) {
    return (
      <Notice>{placeholderText}</Notice>
    );
  }

  const fixedHeaderContent = () => (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.key}
          variant="head"
          align={column.align}
          style={{
            // maxWidth: column.maxWidth,
            width: column.maxWidth ?? columnWidths[column.key],
          }}
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );

  const rowContent = (_index: number, row: RowData) => (
    <>
      {columns.map((column) => (
        <TableCell
          key={column.key}
          align={column.align}
          style={{
            // maxWidth: column.maxWidth,
            // width: column.maxWidth ? undefined : columnWidths[column.key],
            width: column.maxWidth ?? columnWidths[column.key],
            // whiteSpace: column.wrap ? 'normal': 'nowrap',
            whiteSpace: 'normal',
          }}
        >
          {row[column.key]}
        </TableCell>
      ))}
    </>
  );

  return (
    <Paper style={{height: 400, width: '100%'}}>
      <TableVirtuoso
        data={visibleRows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );

  // return (
  //   <VTablePaper
  //     rowCount={visibleRows.length}
  //     showHeader={showHeader}
  //     rowHeight={rowHeight}
  //     headerHeight={headerHeight}
  //   >
  //     {autoSizerProps =>
  //       <Table
  //         {...autoSizerProps}
  //         className={classes.table}
  //         rowCount={visibleRows.length}
  //         rowGetter={({index}) => visibleRows[index]}
  //         rowHeight={rowHeight}
  //         headerHeight={showHeader ? headerHeight : 0}
  //         onRowClick={_onRowClick}
  //         rowClassName={getRowClassName}
  //       >
  //         {columns.map(renderColumn)}
  //       </Table>
  //     }
  //   </VTablePaper>
  // );
}

export default observer(VTable);
