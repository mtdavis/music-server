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

export default class FilteredTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filterText: '',
            filterTextValid: true,
        };
    }

    render() {
        var table = React.cloneElement(this.props.table, {
            rowFilterFunction: this.rowPassesFilter.bind(this),
            ref: 'table'
        });

        return (
            <div>
                <Paper>
                    <div className="table-filter">
                        <TextField
                            hintText="Filter..."
                            errorText={this.state.filterTextValid ? "" : "Error!"}
                            errorStyle={{display: 'none'}}
                            onChange={this.onFilterChange.bind(this)}
                            onKeyUp={this.onFilterChange.bind(this)} />
                    </div>
                </Paper>

                <Paper>
                    {table}
                </Paper>
            </div>
        );
    }

    onFilterChange(event) {
        var filterText = event.target.value;
        var filterTextValid = true;

        if(filterText[0] === "?") {
            // test parsing the expression
            try {
                jsep(filterText.substring(1));
            }
            catch(ex) {
                filterTextValid = false;
            }
        }

        this.setState({
            filterText,
            filterTextValid
        });

        this.refs.table.onFilterChange();
    }

    rowPassesFilter(rowData, columns) {
        var filterText = this.state.filterText;
        var result;
        var filterTextValid = true;

        if(filterText === "") {
            result = true;
        }
        else if(filterText[0] === "?" && this.state.filterTextValid) {
            var astNode = jsep(filterText.substring(1));
            result = evaluateFilterExpression(rowData, astNode, columns);
        }
        else if(filterText[0] === "?" && !this.state.filterTextValid) {
            result = false;
        }
        else {
            result = rowContainsText(rowData, filterText, columns);
        }

        return result;
    }
}
