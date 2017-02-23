import React from 'react';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
    TextField,
} from 'material-ui';
import deepEqual from 'deep-equal';
import MTableRow from './MTableRow.js';
// import Perf from 'react-addons-perf';
// window.Perf = Perf;

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
    getDefaultProps() {
        return {
            placeholderText: "Nothing to see here!",
            columns: [],
            rows: [],
            onRowClick: null,
            onRowCtrlClick: null,
            rowFilterFunction: (rowData, columns) => true,
            showHeader: true,
            initialSortColumnKey: null,
            initialSortOrder: 1
        };
    },

    getInitialState() {
        var sortedFilteredRows = this.getSortedFilteredRows({
            rows: this.props.rows,
            sortColumnKey: this.props.initialSortColumnKey,
            sortOrder: this.props.initialSortOrder
        });

        return {
            sortColumnKey: this.props.initialSortColumnKey,
            sortOrder: this.props.initialSortOrder,
            sortedFilteredRows: sortedFilteredRows
        };
    },

    componentWillReceiveProps(nextProps) {
        if(!deepEqual(this.props.rows, nextProps.rows)) {
            var sortedFilteredRows = this.getSortedFilteredRows({
                rows: nextProps.rows,
                sortColumnKey: this.state.sortColumnKey,
                sortOrder: this.state.sortOrder
            });

            this.setState({sortedFilteredRows});
        }
    },

    shouldComponentUpdate(nextProps, nextState) {
        return !deepEqual(this.state.sortedFilteredRows, nextState.sortedFilteredRows);
    },

    render() {
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

        return table;
    },

    mOnClick(event, rowData) {
        if((event.ctrlKey || event.metaKey) && this.props.onRowCtrlClick) {
            event.preventDefault();
            this.props.onRowCtrlClick(rowData);
        }
        else if(this.props.onRowClick) {
            this.props.onRowClick(rowData);
        }
    },

    onFilterChange() {
        var sortedFilteredRows = this.getSortedFilteredRows({
            rows: this.props.rows,
            sortColumnKey: this.state.sortColumnKey,
            sortOrder: this.state.sortOrder
        });

        this.setState({
            sortedFilteredRows
        });
    },

    setSortColumnKey(newSortColumnKey) {
        var newSortOrder;

        if(this.state.sortColumnKey === newSortColumnKey)
        {
            newSortOrder = -this.state.sortOrder;
        }
        else
        {
            newSortOrder = 1;
        }

        var sortedFilteredRows = this.getSortedFilteredRows({
            rows: this.props.rows,
            sortColumnKey: newSortColumnKey,
            sortOrder: newSortOrder
        });

        this.setState({
            sortColumnKey: newSortColumnKey,
            sortOrder: newSortOrder,
            sortedFilteredRows: sortedFilteredRows
        });
    },

    getSortedFilteredRows({rows, sortColumnKey, sortOrder}) {
        var filteredRows = [];

        for(var i = 0; i < rows.length; i++) {
            var rowData = rows[i];

            if(this.props.rowFilterFunction(rowData, this.props.columns)) {
                filteredRows.push(rowData);
            }
        }

        if(sortColumnKey !== null) {
            filteredRows.sort(getRowComparator(sortColumnKey, sortOrder));
        }

        return filteredRows;
    }
});
