import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import jsep from 'jsep';
import debounce from 'debounce';
import {
  Paper,
  TextField,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

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

const styles = {
  textField: {
    marginTop: 10,
    marginBottom: 16,
    width: 300,
  },
  autoComplete: {
    height: 40,
    marginTop: 10,
  },
  filterBox: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: 16,
    marginBottom: '1rem',
  }
};

@observer
@withStyles(styles)
class FilteredTable extends React.Component {
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

  render() {
    let {classes, rows} = this.props;

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
        <div className={classes.autoComplete} key={filterKey}>
          <MultiSelectAutoComplete
            options={filterOptions}
            hintText={hint}
            onSelectedItemsUpdate={selectedItems =>
              this.onSelectedFilterChange(filterKey, selectedItems)}
          />
        </div>
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

    const filterBox = (
      <Paper className={classes.filterBox}>
        {filterElems}

        <TextField
          className={classes.textField}
          placeholder="Text or query..."
          error={!filterTextValid}
          onChange={this.onTextFilterChange}
          onKeyUp={this.onTextFilterChange} />
      </Paper>
    );

    return (
      <div>
        {filterBox}

        <Paper>
          {table}
        </Paper>
      </div>
    );
  }

  onTextFilterChange = (event) => {
    event.persist();
    this.delayedOnTextFilterChange(event);
  }

  delayedOnTextFilterChange = debounce((event) => {
    this.setState({
      filterText: event.target.value
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

export default FilteredTable;
