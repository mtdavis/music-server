import React from 'react';
import jsep from 'jsep';
import {
    Paper,
    TextField,
} from 'material-ui';

jsep.addBinaryOp(":", 10);
jsep.addBinaryOp("~=", 6);

function rowContainsText(rowData, text, columns)
{
    text = text.toLowerCase();

    for(var i = 0; i < columns.length; i++)
    {
        var column = columns[i];
        var cellValue = rowData[column.key];

        if(column.renderer)
        {
            if(column.renderer(cellValue).toLowerCase().indexOf(text) > -1)
            {
                return true;
            }
        }
        else if(cellValue !== null && cellValue.toString().toLowerCase().indexOf(text) > -1)
        {
            return true;
        }
    }

    return false;
}

var binops =
{
    "+" : function(a, b) { return a + b; },
    "-" : function(a, b) { return a - b; },
    "*" : function(a, b) { return a * b; },
    "/" : function(a, b) { return a / b; },
    ":" : function(a, b) { return a * 60 + b; },
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

var unops = {
    "-" : function(a) { return -a; },
    "+" : function(a) { return +a; }
};

function evaluateFilterExpression(rowData, astNode, columns)
{
    if(astNode.type === "BinaryExpression" ||
        astNode.type === "LogicalExpression")
    {
        return binops[astNode.operator](
            evaluateFilterExpression(rowData, astNode.left, columns),
            evaluateFilterExpression(rowData, astNode.right, columns));
    }
    else if(astNode.type === "UnaryExpression")
    {
        return unops[astNode.operator](
            evaluateFilterExpression(rowData, astNode.argument, columns));
    }
    else if(astNode.type === "Literal")
    {
        return astNode.value;
    }
    else if(astNode.type === "Identifier")
    {
        return rowData[astNode.name];
    }
}

function rowPassesFilter(rowData, filterText, columns) {
    var result;

    if(filterText === "") {
        result = true;
    }
    else if(filterText[0] === "?") {
        var astNode = jsep(filterText.substring(1));
        result = evaluateFilterExpression(rowData, astNode, columns);
    }
    else {
        result = rowContainsText(rowData, filterText, columns);
    }

    return result;
}

export default class FilteredTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterText: '',
        };
    }

    render() {
        var filteredRows = [];
        var filterTextValid = true;

        try {
            for(var i = 0; i < this.props.rows.length; i++) {
                var rowData = this.props.rows[i];

                if(rowPassesFilter(rowData, this.state.filterText, this.props.columns)) {
                    filteredRows.push(rowData);
                }
            }
        }
        catch(ex) {
            filterTextValid = false;
        }

        var table = React.cloneElement(this.props.table, {
            rows: filteredRows,
            columns: this.props.columns
        });

        var filterField = (
            <div className="table-filter">
                <TextField
                    hintText="Filter..."
                    errorText={filterTextValid ? "" : "Error!"}
                    errorStyle={{display: 'none'}}
                    onChange={this.onFilterChange.bind(this)}
                    onKeyUp={this.onFilterChange.bind(this)} />
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

    onFilterChange(event) {
        this.setState({
            filterText: event.target.value
        });
    }
}
