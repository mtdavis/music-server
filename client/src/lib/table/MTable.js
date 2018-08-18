import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
} from 'material-ui';
import stable from 'stable';
import MTableRow from './MTableRow';
import MTableHeader from './MTableHeader';
import {compare} from '../util';
import Perf from 'react-addons-perf';
window.Perf = Perf;

function getRowComparator(columnKey, order) {
  return function(rowA, rowB) {
    const valA = rowA[columnKey];
    const valB = rowB[columnKey];
    return compare(valA, valB) * order;
  };
}

function sortBySpecs(rows, sortSpecs) {
  let sortedRows = rows.slice();

  for(const sortSpec of sortSpecs) {
    const {columnKey, order} = sortSpec;
    const comparator = getRowComparator(columnKey, order);
    sortedRows = stable(sortedRows, comparator);
  }

  return sortedRows;
}

@observer
export default class MTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortSpecs: this.props.initialSortSpecs,
      clickCount: 0,
    };
  }

  componentWillUnmount() {
    clearTimeout(this._doubleClickTimeout);
  }

  render() {
    const sortedRows = sortBySpecs(this.props.rows, this.state.sortSpecs);

    const rowNodes = sortedRows.map(rowData =>
      <MTableRow
        key={rowData.id}
        rowData={rowData}
        columns={this.props.columns}
        mOnClick={this.mOnClick}
        cursor={this.props.onRowClick ? 'pointer' : 'auto'}
      />
    );

    let table;
    if(rowNodes.length === 0) {
      table = (
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn>
                {this.props.placeholderText}
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      );
    }
    else if(rowNodes.length > this.props.rowLimit) {
      table = (
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn>
                {rowNodes.length} rows; specify some filter criteria.
              </TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      );
    }
    else {
      table = (
        <Table
          fixedHeader={false}
          selectable={false}
          style={{tableLayout:'auto'}}>
          {
            this.props.showHeader &&
            <MTableHeader
              columns={this.props.columns}
              sortColumnKey={this.getTopSortSpec().columnKey}
              sortOrder={this.getTopSortSpec().order}
              setSortColumnKey={this.setSortColumnKey}
            />
          }
          <TableBody showRowHover={true} displayRowCheckbox={false}>
            {rowNodes}
          </TableBody>
        </Table>
      );
    }

    return table;
  }

  mOnClick = (event, rowData) => {
    if((event.ctrlKey || event.metaKey) && this.props.onRowCtrlClick) {
      event.preventDefault();
      this.props.onRowCtrlClick(rowData);
    }
    else if(this.props.onRowClick) {
      if(this.state.clickCount === 0) {
        this.setState({clickCount: 1});
        this._doubleClickTimeout = setTimeout(
          () => this.setState({clickCount: 0}), 500
        );
      }
      else {
        this.setState({clickCount: 0});
        clearTimeout(this._doubleClickTimeout);

        this.props.onRowClick(rowData);
      }
    }
  }

  setSortColumnKey = (newSortColumnKey) => {
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

      sortSpec.order = -sortSpec.order;
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
      return {
        columnKey: null,
        order: 1
      };
    }

    return sortSpecs[sortSpecs.length - 1];
  }
}

MTable.defaultProps = {
  placeholderText: "Nothing to see here!",
  columns: [],
  rows: [],
  onRowClick: null,
  onRowCtrlClick: null,
  showHeader: true,
  initialSortSpecs: [],
  rowLimit: Infinity
};

MTable.propTypes = {
  placeholderText: PropTypes.string,

  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string,
      textAlign: PropTypes.oneOf(['left', 'right']),
      renderer: PropTypes.func,
      wrap: PropTypes.boolean
    })
  ),

  rows: PropTypes.array,

  onRowClick: PropTypes.func,

  onRowCtrlClick: PropTypes.func,

  showHeader: PropTypes.bool,

  initialSortSpecs: PropTypes.arrayOf(
    PropTypes.shape({
      columnKey: PropTypes.string.isRequired,
      order: PropTypes.oneOf([1, -1])
    })
  ),

  rowLimit: PropTypes.number
};
