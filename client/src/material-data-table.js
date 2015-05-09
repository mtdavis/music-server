var React = require('react');

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
    getInitialState: function() {
        return {
            sortColumnKey:null,
            sortOrder:1
        };
    },

    render: function() {
        if(this.state.sortColumnKey !== null)
        {
            this.props.rows.sort(this.compareRows);
        }

        var tableRows = this.props.rows.map(function(rowData)
        {
            return <TableRow
                key={rowData.id}
                rowData={rowData}
                columns={this.props.columns}
                onRowClick={this.props.onRowClick} />;
        }.bind(this));

        return (
            <div className="table-responsive-vertical shadow-z-1">
                <table className="table table-hover">
                    <TableHeader columns={this.props.columns} setSortColumnKey={this.setSortColumnKey}/>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        );
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
