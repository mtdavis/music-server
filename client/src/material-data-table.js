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
            return <TableRow
                key={rowData.id}
                rowData={rowData}
                columns={this.props.columns}
                onRowClick={this.props.onRowClick} />;
        }.bind(this));

        return (
            <div className="table-responsive-vertical shadow-z-1">
                <table className="table table-hover">
                    <TableHeader columns={this.props.columns} />
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        );
    }
});
