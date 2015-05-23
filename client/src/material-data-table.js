var React = require('react');
var mui = require('material-ui');

var {TextField} = mui;

var TableCell = React.createClass({
    render: function() {
        var text;

        if(this.props.renderer && this.props.value !== null && this.props.value !== undefined)
        {
            text = this.props.renderer(this.props.value);
        }
        else if(this.props.value !== null && this.props.value !== undefined)
        {
            text = this.props.value;
        }
        else
        {
            text = "-";
        }

        return (
            <td data-title={this.props.header}>{text}</td>
        );
    }
})

var TableRow = React.createClass({
    render: function() {
        var tds = this.props.columns.map(function(column)
        {
            var value = this.props.rowData[column.key];
            return (
                <TableCell
                    key={column.key}
                    value={value}
                    header={column.header}
                    renderer={column.renderer} />
            );
        }.bind(this));

        return (
            <tr onClick={this.onClick} style={{cursor:"pointer"}}>
                {tds}
            </tr>
        );
    },

    onClick: function() {
        if(this.props.onRowClick)
        {
            this.props.onRowClick(this.props.rowData);
        }
    }
});

var TableHeader = React.createClass({
    render: function() {
        var ths = this.props.columns.map(function(column)
        {
            var setSortColumnKey = function()
            {
                this.props.setSortColumnKey(column.key);
            }.bind(this);

            return (
                <th key={column.key} onClick={setSortColumnKey}>
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
})

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            placeholderText:"Nothing to see here!"
        };
    },

    getInitialState: function() {
        return {
            filterText:"",
            sortColumnKey:null,
            sortOrder:1
        };
    },

    render: function() {
        if(this.state.sortColumnKey !== null)
        {
            this.props.rows.sort(this.compareRows);
        }

        var tableRows = [];

        for(var i = 0; i < this.props.rows.length; i++)
        {
            var rowData = this.props.rows[i];

            if(this.rowContainsText(rowData, this.state.filterText, this.props.columns))
            {
                tableRows.push(<TableRow
                    key={rowData.id}
                    rowData={rowData}
                    columns={this.props.columns}
                    onRowClick={this.props.onRowClick} />);
            }
        }

        var table;
        if(tableRows.length === 0)
        {
            table = (
                <div className="table-placeholder shadow-z-1">
                    {this.props.placeholderText}
                </div>
            );
        }
        else
        {
            table = (
                <div className="table-responsive-vertical shadow-z-1">
                    <table className="table table-hover">
                        <TableHeader columns={this.props.columns} setSortColumnKey={this.setSortColumnKey}/>
                        <tbody>
                            {tableRows}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div>
                <div className="table-filter shadow-z-1">
                    <TextField
                        hintText="Filter..."
                        onChange={this.onFilterChange}
                        onKeyUp={this.onFilterChange} />
                </div>
                {table}
            </div>
        );
    },

    rowContainsText: function(rowData, text, columns)
    {
        if(text === "")
        {
            return true;
        }

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
    },

    onFilterChange: function(event)
    {
        this.setState({
            filterText: event.target.value
        });
        console.log(this.state.filterText);
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
