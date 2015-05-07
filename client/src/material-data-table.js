var React = require('react');
var {Paper} = require('material-ui');

var TableCell = React.createClass({
    render: function() {
        return (
            <td>{this.props.value}</td>
        );
    }
})

var TableRow = React.createClass({
    render: function() {
        var tds = this.props.columns.map(function(column)
        {
            var value = this.props.rowData[column.key];
            return <TableCell key={column.key} value={value} />;
        }.bind(this));

        return (
            <tr>
                {tds}
            </tr>
        );
    }
});

var TableHeader = React.createClass({
    render: function() {
        var ths = this.props.columns.map(function(column)
        {
            return <th key={column.key}>{column.header}</th>
        });

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
    render: function() {

        var tableRows = this.props.rows.map(function(rowData)
        {
            return <TableRow key={rowData.id} rowData={rowData} columns={this.props.columns} />
        }.bind(this));

        return (
            <Paper className="table-responsive-vertical">
                <table className="table table-hover">
                    <TableHeader columns={this.props.columns} />
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </Paper>
        );
    }
});
