import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import equal from 'fast-deep-equal';
import {
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import {
  Column,
  Table,
  RowMouseEventHandlerParams,
  TableCellProps,
} from 'react-virtualized';

import VTablePaper from './VTablePaper';
import VTableCell, {renderValue} from './VTableCell';
import VTableHeader from './VTableHeader';
import Notice from '../Notice';
import {renderIcon, sortBySpecs} from './util';

const styles = (theme: Theme) => ({
  table: {
    fontFamily: theme.typography.fontFamily,
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box' as 'border-box',
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
});

export interface Props<R extends RowData> extends WithStyles<typeof styles> {
  columns: ColumnConfig[];
  rows: R[];
  headerHeight?: number;
  rowHeight?: number;
  loading?: boolean;
  showHeader?: boolean;
  onRowClick?: (row: R) => void;
  onRowCtrlClick?: (row: R) => void;
  placeholderText: string;
  initialSortSpecs?: SortSpec[],
}

interface State {
  sortSpecs: SortSpec[];
  columnWidths: {[key: string]: number};
}

class VTable<R extends RowData> extends React.Component<Props<R>, State> {
  constructor(props: Props<R>) {
    super(props);
    this.state = {
      sortSpecs: this.props.initialSortSpecs || [],
      columnWidths: {},
    };
  }

  componentWillMount() {
    this.calculateColumnWidths();
  }

  componentDidUpdate() {
    this.calculateColumnWidths();
  }

  calculateColumnWidths() {
    const {columns, rows} = this.props;
    const columnWidths: {[key: string]: number} = {};

    columns.forEach(column => {
      columnWidths[column.key] = 4; // arbitrary good starting point

      rows.forEach(row => {
        const renderedValue = renderValue(row[column.key], column);
        const length = String(renderedValue).length;

        if(columnWidths[column.key] < length) {
          columnWidths[column.key] = length;
        }
      });
    });

    if(!equal(this.state.columnWidths, columnWidths)) {
      this.setState({columnWidths});
    }
  }

  getRowClassName = ({
    index
  }: {index: number}) => {
    const {classes, onRowClick} = this.props;

    return classNames(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick,
    });
  }

  onRowClick = ({
    event,
    rowData,
  }: RowMouseEventHandlerParams) => {
    if((event.ctrlKey || event.metaKey) && this.props.onRowCtrlClick) {
      event.preventDefault();
      this.props.onRowCtrlClick(rowData);
    }
    else if(this.props.onRowClick) {
      this.props.onRowClick(rowData);
    }
  }

  setSortColumnKey = (newSortColumnKey: string) => {
    const newSortSpecs = this.state.sortSpecs.slice();

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

    this.setState({sortSpecs: newSortSpecs});
  }

  getTopSortSpec() {
    const {sortSpecs} = this.state;
    if(sortSpecs.length === 0) {
      return null;
    }

    return sortSpecs[sortSpecs.length - 1];
  }

  render() {
    const {
      classes,
      columns,
      headerHeight = 64,
      loading = false,
      placeholderText,
      rowHeight = 56,
      showHeader = true,
    } = this.props;

    if(loading) {
      return (
        <Notice loading>Loading...</Notice>
      );
    }

    if(this.props.rows.length === 0 && placeholderText) {
      return (
        <Notice>{placeholderText}</Notice>
      );
    }

    const rows = sortBySpecs(this.props.rows, this.state.sortSpecs);

    return (
      <VTablePaper rowCount={rows.length} showHeader={showHeader} rowHeight={rowHeight} headerHeight={headerHeight}>
        {autoSizerProps =>
          <Table
            {...autoSizerProps}
            className={classes.table}
            rowCount={rows.length}
            rowGetter={({index}) => rows[index]}
            rowHeight={rowHeight}
            headerHeight={showHeader ? headerHeight : 0}
            onRowClick={this.onRowClick}
            rowClassName={this.getRowClassName}
          >
            {columns.map(this.renderColumn)}
          </Table>
        }
      </VTablePaper>
    );
  }

  renderColumn = (column: ColumnConfig) => {
    const {
      classes,
      headerHeight = 64,
      rowHeight = 56,
      showHeader = true,
    } = this.props;

    const headerRenderer = showHeader ? (() => (
      <VTableHeader
        column={column}
        headerHeight={headerHeight}
        topSortSpec={this.getTopSortSpec()}
        setSortColumnKey={this.setSortColumnKey}
      />
    )) : undefined;

    const cellRenderer = ({cellData}: TableCellProps) => (
      <VTableCell
        value={cellData}
        column={column}
        rowHeight={rowHeight}
      />
    );

    const width = Math.sqrt(this.state.columnWidths[column.key]);

    return (
      <Column
        key={column.key}
        dataKey={column.key}

        className={classes.flexContainer}

        headerRenderer={headerRenderer}

        cellRenderer={cellRenderer}

        flexGrow={width}
        flexShrink={width}
        width={width}
        maxWidth={column.renderer === renderIcon ? 48 : undefined}
      />
    );
  }
}

export default withStyles(styles)(VTable);
