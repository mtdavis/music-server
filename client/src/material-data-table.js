var React = require('react');
var mui = require('material-ui');
var {TextField, FontIcon} = mui;
var jsep = require('jsep');
var deepEqual = require('deep-equal');

jsep.addBinaryOp(":", 10);
jsep.addBinaryOp("~=", 6);

var TableCell = React.createClass({
    getDefaultProps: function() {
        return {
            renderer: x => x,
            value: null,
            header: "",
            //default textAlign value is undefined so that responsive mode works
            //(since in small screens, all text-align = right)
            textAlign: undefined
        };
    },

    render: function() {
        var style = {};
        if(this.props.textAlign)
        {
            style.textAlign = this.props.textAlign;
        }

        var content;

        if(this.props.renderer === "icon")
        {
            content = <FontIcon className={this.props.value} />;
            style.width = "48px";
        }
        else if(this.props.value !== null && this.props.value !== undefined)
        {
            content = this.props.renderer(this.props.value);
        }
        else
        {
            content = "-";
        }

        return (
            <td data-title={this.props.header} style={style}>
                {content}
            </td>
        );
    }
})

var TableRow = React.createClass({
    getDefaultProps: function() {
        return {
            columns: [],
            value: null,
            onRowClick: null,
            onRowCtrlClick: null
        };
    },

    render: function() {
        var tds = this.props.columns.map(function(column)
        {
            var value = this.props.rowData[column.key];
            return (
                <TableCell
                    key={column.key}
                    value={value}
                    header={column.header}
                    renderer={column.renderer}
                    textAlign={column.textAlign} />
            );
        }.bind(this));

        var style;
        if(this.props.onRowClick)
        {
            style = {cursor: "pointer"}
        }

        return (
            <tr onClick={this.onClick} style={style}>
                {tds}
            </tr>
        );
    },

    onClick: function(event) {
        if((event.ctrlKey || event.metaKey) && this.props.onRowCtrlClick)
        {
            event.preventDefault();
            this.props.onRowCtrlClick(this.props.rowData);
        }
        else if(this.props.onRowClick)
        {
            this.props.onRowClick(this.props.rowData);
        }
    }
});

var TableHeader = React.createClass({
    getDefaultProps: function() {
        return {
            columns: [],
            setSortColumnKey: null
        };
    },

    render: function() {
        var ths = this.props.columns.map(function(column)
        {
            var setSortColumnKey = function()
            {
                this.props.setSortColumnKey(column.key);
            }.bind(this);

            return (
                <th key={column.key} onClick={setSortColumnKey} style={{textAlign:column.textAlign}}>
                    {column.header}
                </th>
            );
        }.bind(this));

        return (
            <thead>
                <tr>
                    {ths}
                </tr>
            </thead>
        );
    }
});

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

function rowPassesFilter(rowData, filterText, columns)
{
    if(filterText === "")
    {
        return true;
    }
    else if(filterText[0] === "?")
    {
        var astNode = jsep(filterText.substring(1));
        return evaluateFilterExpression(rowData, astNode, columns);
    }
    else
    {
        return rowContainsText(rowData, filterText, columns);
    }
}

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            placeholderText:"Nothing to see here!",
            columns: [],
            rows: [],
            onRowClick: null,
            onRowCtrlClick: null,
            showHeader: true,
            showFilter: true,
            responsive: true,
            condensed: false,
            initialSortColumnKey:null,
            initialSortOrder:1
        };
    },

    getInitialState: function() {
        return {
            filterText:"",
            sortColumnKey:this.props.initialSortColumnKey,
            sortOrder:this.props.initialSortOrder
        };
    },

    shouldComponentUpdate(nextProps, nextState) {
        return !deepEqual(this.props, nextProps) ||
            !deepEqual(this.state, nextState);
    },

    render: function() {
        console.log("rendering");
        var sortedRows = this.props.rows.slice();

        if(this.state.sortColumnKey !== null)
        {
            sortedRows.sort(this.compareRows);
        }

        var filterTextValid = true;
        var filteredRows = [];

        try
        {
            for(var i = 0; i < sortedRows.length; i++)
            {
                var rowData = sortedRows[i];

                if(rowPassesFilter(rowData, this.state.filterText, this.props.columns))
                {
                    filteredRows.push(<TableRow
                        key={rowData.id}
                        rowData={rowData}
                        columns={this.props.columns}
                        onRowClick={this.props.onRowClick}
                        onRowCtrlClick={this.props.onRowCtrlClick}
                    />);
                }
            }
        }
        catch(ex)
        {
            filterTextValid = false;
        }

        var table;
        if(filteredRows.length === 0)
        {
            table = (
                <div className="table-placeholder shadow-z-1">
                    {this.props.placeholderText}
                </div>
            );
        }
        else
        {
            var wrapperClassName = "shadow-z-1";
            wrapperClassName += this.props.responsive ? " table-responsive-vertical" : "";

            var tableClassName = "table table-hover"
            tableClassName += this.props.condensed ? " table-condensed" : "";

            table = (
                <div className={wrapperClassName}>
                    <table className={tableClassName}>
                        {this.props.showHeader &&
                            <TableHeader
                                columns={this.props.columns}
                                setSortColumnKey={this.setSortColumnKey}
                            />
                        }
                        <tbody>
                            {filteredRows}
                        </tbody>
                    </table>
                </div>
            );
        }

        var filter = (
            <div className="table-filter shadow-z-1">
                <TextField
                    hintText="Filter..."
                    errorText={filterTextValid ? "" : "Error!"}
                    onChange={this.onFilterChange}
                    onKeyUp={this.onFilterChange} />
            </div>
        );

        return (
            <div>
                {this.props.showFilter && filter}
                {table}
            </div>
        );
    },

    onFilterChange: function(event)
    {
        this.setState({
            filterText: event.target.value
        });
    },

    setSortColumnKey: function(columnKey) {
        if(this.state.sortColumnKey === columnKey)
        {
            var currentSortOrder = this.state.sortOrder;
            var newSortOrder = -currentSortOrder;
            this.setState({
                sortOrder: newSortOrder
            });
        }
        else
        {
            this.setState({
                sortColumnKey: columnKey,
                sortOrder: 1
            });
        }
    },

    compareRows: function(rowA, rowB) {
        var result;

        var valA = rowA[this.state.sortColumnKey];
        var valB = rowB[this.state.sortColumnKey];

        if(typeof(valA) === "string" && valA.startsWith("The "))
        {
            valA = valA.substring(4);
        }

        if(typeof(valB) === "string" && valB.startsWith("The "))
        {
            valB = valB.substring(4);
        }

        if(valA < valB)
        {
            result = -1;
        }
        else if(valA === valB)
        {
            result = 0;
        }
        else
        {
            result = 1;
        }

        return result * this.state.sortOrder;
    }
});
