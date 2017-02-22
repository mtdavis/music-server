var React = require('react');
var mui = require('material-ui');
var {Paper, TextField, FontIcon, Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} = mui;
var jsep = require('jsep');
var deepEqual = require('deep-equal');

jsep.addBinaryOp(":", 10);
jsep.addBinaryOp("~=", 6);

var MTableRowColumn = React.createClass({
    render: function() {
        var {value, renderer, textAlign, wrap, style, mOnClick, ...props} = this.props;

        if(!renderer) {
            renderer = (x) => x;
        }

        if(!textAlign) {
            textAlign = 'left';
        }

        if(wrap === undefined) {
            wrap = true;
        }

        var content;
        style.padding = 0;

        if(renderer === "icon")
        {
            content = <FontIcon className={value} />;
            style.width = "48px";
        }
        else if(value !== null && value !== undefined)
        {
            content = renderer(value);
        }
        else
        {
            content = "-";
        }

        var divStyle = {
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            justifyContent: textAlign==='right' ? 'flex-end' : 'flex-start',
            whiteSpace: wrap ? 'normal' : 'nowrap'
        };

        return (
            <TableRowColumn {...props} style={style}>
                <div onClick={mOnClick} style={divStyle}>
                    {content}
                </div>
            </TableRowColumn>
        );
    }
});

var MTableRow = React.createClass({
    shouldComponentUpdate: function(nextProps, nextState) {
        return !deepEqual(this.props.columns, nextProps.columns) ||
            !deepEqual(this.props.rowData, nextProps.rowData) ||
            !deepEqual(this.props.displayBorder, nextProps.displayBorder);
    },

    render: function() {
        var {columns, rowData, cursor, style, mOnClick, ...props} = this.props;

        var cells = columns.map(column =>
            <MTableRowColumn
                key={column.key}
                value={rowData[column.key]}
                mOnClick={this.mOnClick}
                renderer={column.renderer}
                textAlign={column.textAlign}
                wrap={column.wrap} />
        );

        style = style || {};
        style.cursor = cursor;

        return (
            <TableRow {...props} style={style}>
                {cells}
            </TableRow>
        )
    },

    mOnClick: function(event) {
        this.props.mOnClick(event, this.props.rowData);
    }
});

function renderTableHeader({columns, setSortColumnKey}) {
    var cells = columns.map(column =>
        <TableHeaderColumn key={column.key} style={{
                padding: 0
            }}>
            <div onClick={() => setSortColumnKey(column.key)} style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    cursor: 'pointer',
                    justifyContent: column.textAlign==='right' ? 'flex-end' : 'flex-start',
                }}>
                {column.header}
            </div>
        </TableHeaderColumn>
    );

    return (
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
                {cells}
            </TableRow>
        </TableHeader>
    );
}

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

function getRowComparator(sortColumnKey, sortOrder) {
    return function(rowA, rowB) {
        var result;

        var valA = rowA[sortColumnKey];
        var valB = rowB[sortColumnKey];

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

        return result * sortOrder;
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
            condensed: false,
            initialSortColumnKey: null,
            initialSortOrder: 1
        };
    },

    getInitialState: function() {
        var sortedRows = this.props.rows.slice();

        if(this.props.initialSortColumnKey !== null)
        {
            sortedRows.sort(getRowComparator(
                this.props.initialSortColumnKey, this.props.initialSortOrder));
        }

        // no filter initially.

        return {
            sortedFilteredRows: sortedRows,
            filterText: "",
            filterTextValid: true,
            sortColumnKey: this.props.initialSortColumnKey,
            sortOrder: this.props.initialSortOrder
        };
    },

    componentWillReceiveProps(nextProps) {
        if(!deepEqual(this.props.rows, nextProps.rows)) {
            this.resortAndFilterRows(nextProps.rows);
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return !deepEqual(this.state.sortedFilteredRows, nextState.sortedFilteredRows);
    },

    render: function() {
        var rowNodes = this.state.sortedFilteredRows.map(rowData =>
            <MTableRow
                key={rowData.id}
                rowData={rowData}
                columns={this.props.columns}
                mOnClick={this.mOnClick}
                cursor={this.props.onRowClick ? 'pointer' : 'auto'}
            />
        );

        var table;
        if(rowNodes.length === 0)
        {
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
        else
        {
            table = (
                <Table
                    onCellClick={this.onCellClick}
                    fixedHeader={false}
                    selectable={false}
                    style={{tableLayout:'auto'}}>

                    {this.props.showHeader &&
                        renderTableHeader({
                            columns: this.props.columns,
                            setSortColumnKey: this.setSortColumnKey
                        })
                    }
                    <TableBody showRowHover={true} displayRowCheckbox={false}>
                        {rowNodes}
                    </TableBody>
                </Table>
            );
        }

        var filter = (
            <div className="table-filter">
                <TextField
                    hintText="Filter..."
                    errorText={this.state.filterTextValid ? "" : "Error!"}
                    errorStyle={{display: 'none'}}
                    onChange={this.onFilterChange}
                    onKeyUp={this.onFilterChange} />
            </div>
        );

        return (
            <div>
                <Paper>
                    {this.props.showFilter && filter}
                </Paper>

                <Paper>
                    {table}
                </Paper>
            </div>
        );
    },

    mOnClick: function(event, rowData) {
        if((event.ctrlKey || event.metaKey) && this.props.onRowCtrlClick) {
            event.preventDefault();
            this.props.onRowCtrlClick(rowData);
        }
        else if(this.props.onRowClick) {
            this.props.onRowClick(rowData);
        }
    },

    onFilterChange: function(event) {
        this.setState({
            filterText: event.target.value
        }, this.resortAndFilterRows);
    },

    setSortColumnKey: function(columnKey) {
        if(this.state.sortColumnKey === columnKey)
        {
            var currentSortOrder = this.state.sortOrder;
            var newSortOrder = -currentSortOrder;
            this.setState({
                sortOrder: newSortOrder
            }, this.resortAndFilterRows);
        }
        else
        {
            this.setState({
                sortColumnKey: columnKey,
                sortOrder: 1
            }, this.resortAndFilterRows);
        }
    },

    resortAndFilterRows: function(rows) {
        if(rows === undefined) {
            rows = this.props.rows;
        }

        var filteredRows = [];

        this.setState({filterTextValid: true});

        try {
            for(var i = 0; i < rows.length; i++)
            {
                var rowData = rows[i];

                if(rowPassesFilter(rowData, this.state.filterText, this.props.columns))
                {
                    filteredRows.push(rowData);
                }
            }
        }
        catch(ex) {
            this.setState({filterTextValid: false});
        }

        if(this.state.sortColumnKey !== null) {
            filteredRows.sort(getRowComparator(
                this.state.sortColumnKey, this.state.sortOrder));
        }


        this.setState({sortedFilteredRows: filteredRows})
    }
});
