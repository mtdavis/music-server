import React, {PropTypes} from 'react';
import jsep from 'jsep';
import debounce from 'debounce';
import {
  Paper,
  TextField,
} from 'material-ui';
import MultiSelectAutoComplete from '../MultiSelectAutoComplete';
import {compare} from '../util';
import MTable from './MTable';

jsep.addBinaryOp(":", 10);
jsep.addBinaryOp("~=", 6);

function rowContainsText(rowData, text, columns) {
  text = text.toLowerCase();

  for(let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const cellValue = rowData[column.key];

    if(column.renderer) {
      if(String(column.renderer(cellValue)).toLowerCase().indexOf(text) > -1) {
        return true;
      }
    }
    else if(cellValue !== null && cellValue.toString().toLowerCase().indexOf(text) > -1) {
      return true;
    }
  }

  return false;
}

const binops = {
  "+" : function(a, b) { return a + b; },
  "-" : function(a, b) { return a - b; },
  "*" : function(a, b) { return a * b; },
  "/" : function(a, b) { return a / b; },
  ":" : function(a, b) { return (a * 60) + b; },
  "<" : function(a, b) { return a < b; },
  "<=" : function(a, b) { return a <= b; },
  "==" : function(a, b) { return a == b; },
  ">=" : function(a, b) { return a >= b; },
  ">" : function(a, b) { return a > b; },
  "!=" : function(a, b) { return a != b; },
  "~=" : function(a, b) { return a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) > -1; },
  "&&" : function(a, b) { return a && b; },
  "||" : function(a, b) { return a || b; },
};

const unops = {
  "-" : function(a) { return -a; },
  "+" : function(a) { return +a; },
  "!" : function(a) { return !a; },
};

function evaluateFilterExpression(rowData, astNode, columns) {
  if(astNode.type === "BinaryExpression" ||
    astNode.type === "LogicalExpression") {
    return binops[astNode.operator](
      evaluateFilterExpression(rowData, astNode.left, columns),
      evaluateFilterExpression(rowData, astNode.right, columns));
  }
  else if(astNode.type === "UnaryExpression") {
    return unops[astNode.operator](
      evaluateFilterExpression(rowData, astNode.argument, columns));
  }
  else if(astNode.type === "Literal") {
    return astNode.value;
  }
  else if(astNode.type === "Identifier") {
    if(astNode.name === 'last_play') {
      const date = new Date(rowData[astNode.name] * 1000);
      return date.toISOString().substring(0, 10);
    }

    return rowData[astNode.name];
  }
}

function rowPassesFilter(rowData, filterText, columns) {
  let result;

  if(filterText === "") {
    result = true;
  }
  else if(filterText[filterText.length-1] === "?") {
    const astNode = jsep(filterText.substring(0, filterText.length-1));
    result = evaluateFilterExpression(rowData, astNode, columns);
  }
  else {
    result = rowContainsText(rowData, filterText, columns);
  }

  return result;
}

function getUniqueValues(objects, key) {
  const result = [];
  for(const object of objects) {
    const value = object[key];
    if(!result.includes(value)) {
      result.push(value);
    }
  }
  result.sort(compare);
  return result;
}

export default class FilteredTable extends React.Component {
  constructor(props) {
    super(props);

    const selectedFilters = {};
    for(const filterKey of props.filterKeys) {
      selectedFilters[filterKey] = [];
    }

    this.state = {
      selectedFilters: selectedFilters,
      filterText: '',
    };
  }

  setTextFilterField = (element) => {
    this.textFilterField = element;
  }

  render() {
    let rows = this.props.rows;

    const filterElems = [];

    for(const filterKey of this.props.filterKeys) {
      const selectedFilters = this.state.selectedFilters[filterKey];

      // first determine the options that have not already been selected
      // or filtered out by a previous filter.
      const filterOptions = getUniqueValues(rows, filterKey).filter(
        val => !selectedFilters.includes(val));

      const hint = filterKey.charAt(0).toUpperCase() +
        filterKey.substring(1).replace(/_/g, ' ') +
        '...';

      filterElems.push(
        <MultiSelectAutoComplete
          key={filterKey}
          dataSource={filterOptions}
          hintText={hint}
          onSelectedItemsUpdate={selectedItems =>
            this.onSelectedFilterChange(filterKey, selectedItems)}
        />
      );

      // now filter the rows by those selected filters.
      if(selectedFilters.length > 0) {
        rows = rows.filter(rowData =>
          selectedFilters.includes(rowData[filterKey])
        );
      }
    }

    // filter by the text.

    let filterTextValid = true;

    try {
      rows = rows.filter(rowData =>
        rowPassesFilter(rowData, this.state.filterText, this.props.columns)
      );
    }
    catch(ex) {
      filterTextValid = false;
    }

    const table = React.cloneElement(this.props.table, {
      rows: rows,
      columns: this.props.columns
    });

    const filterField = (
      <div className="table-filter">
        {filterElems}

        <TextField
          ref={this.setTextFilterField}
          hintText="Text or query..."
          errorText={filterTextValid ? "" : "Error!"}
          errorStyle={{display: 'none'}}
          onChange={this.onTextFilterChange}
          onKeyUp={this.onTextFilterChange} />
      </div>
    );

    return (
      <div>
        <Paper>
          {filterField}
        </Paper>

        <Paper>
          {table}
        </Paper>
      </div>
    );
  }

  onTextFilterChange = debounce(() => {
    this.setState({
      filterText: this.textFilterField.input.value
    });
  }, 200)

  onSelectedFilterChange = (filterKey, selectedItems) => {
    const selectedFilters = Object.assign({}, this.state.selectedFilters);
    selectedFilters[filterKey] = selectedItems.slice();
    this.setState({selectedFilters});
  }
}

FilteredTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,

  filterKeys: PropTypes.arrayOf(PropTypes.string).isRequired,

  columns: MTable.propTypes.columns,

  table: PropTypes.node.isRequired
};
