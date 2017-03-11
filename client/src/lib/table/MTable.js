import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
  TextField,
} from 'material-ui';
import deepEqual from 'deep-equal';
import stable from 'stable';
import MTableRow from './MTableRow.js';
import MTableHeader from './MTableHeader.js';
import {compare} from '../util';
import Perf from 'react-addons-perf';
window.Perf = Perf;

function getRowComparator(columnKey, order) {
  return function(rowA, rowB) {
    var valA = rowA[columnKey];
    var valB = rowB[columnKey];
    return compare(valA, valB) * order;
  }
}

function sortBySpecs(rows, sortSpecs) {
  var sortedRows = rows.slice();

  for(let sortSpec of sortSpecs) {
    let {columnKey, order} = sortSpec;
    let comparator = getRowComparator(columnKey, order);
    sortedRows = stable(sortedRows, comparator);
  }

  return sortedRows;
}

module.exports = React.createClass({
  getDefaultProps() {
    return {
      placeholderText: "Nothing to see here!",
      columns: [],
      rows: [],
      onRowClick: null,
      onRowCtrlClick: null,
      showHeader: true,
      initialSortSpecs: [],
      rowLimit: Infinity
    };
  },

  getInitialState() {
    return {
      sortSpecs: this.props.initialSortSpecs,
      clickCount: 0,
    };
  },

  componentWillUnmount() {
    clearTimeout(this._doubleClickTimeout);
  },

  render() {
    var sortedRows = sortBySpecs(this.props.rows, this.state.sortSpecs);

    var rowNodes = sortedRows.map(rowData =>
      <MTableRow
        key={rowData.id}
        rowData={rowData}
        columns={this.props.columns}
        mOnClick={this.mOnClick}
        cursor={this.props.onRowClick ? 'pointer' : 'auto'}
      />
    );

    var table;
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
  },

  mOnClick(event, rowData) {
    if((event.ctrlKey || event.metaKey) && this.props.onRowCtrlClick) {
      event.preventDefault();
      this.props.onRowCtrlClick(rowData);
    }
    else if(this.props.onRowClick) {
      if(this.state.clickCount === 0) {
        this.setState({clickCount: 1});
        this._doubleClickTimeout = setTimeout(
          () => this.setState({clickCount: 0}), 250
        );
      }
      else {
        this.setState({clickCount: 0});
        clearTimeout(this._doubleClickTimeout);

        this.props.onRowClick(rowData);
      }
    }
  },

  setSortColumnKey(newSortColumnKey) {
    let newSortSpecs = this.state.sortSpecs.slice();

    // check if newSortColumnKey is already in sortSpecs
    let existingIndex = newSortSpecs.findIndex(
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
      let sortSpec = Object.assign({}, newSortSpecs[existingIndex]);
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
  },

  getTopSortSpec() {
    let {sortSpecs} = this.state;
    if(sortSpecs.length === 0) {
      return {
        columnKey: null,
        order: 1
      };
    }

    return sortSpecs[sortSpecs.length - 1];
  },
});
