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
import MTableHeader from './MTableHeader.js';
import {compare} from '../util';
import Perf from 'react-addons-perf';
window.Perf = Perf;

function getRowComparator(sortColumnKey, sortOrder) {
    return function(rowA, rowB) {
        var valA = rowA[sortColumnKey];
        var valB = rowB[sortColumnKey];
        return compare(valA, valB) * sortOrder;
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
            showHeader: true,
            initialSortColumnKey: null,
            initialSortOrder: 1,
            rowLimit: Infinity
        };
    },

    getInitialState() {
        return {
            sortColumnKey: this.props.initialSortColumnKey,
            sortOrder: this.props.initialSortOrder,
            clickCount: 0,
        };
    },

    componentWillUnmount() {
        clearTimeout(this._doubleClickTimeout);
    },

    render() {
        var sortedRows = this.props.rows.slice();
        if(this.state.sortColumnKey !== null) {
            sortedRows.sort(getRowComparator(
                this.state.sortColumnKey, this.state.sortOrder));
        }

        var rowNodes = sortedRows.map(rowData =>
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
        else if(rowNodes.length > this.props.rowLimit) {
            table = (
                <Table selectable={false}>
                    <TableBody displayRowCheckbox={false}>
                        <TableRow>
                            <TableRowColumn>
                                {rowNodes.length} rows; specify some filter criteria.
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

                    {
                        this.props.showHeader &&
                        <MTableHeader
                            columns={this.props.columns}
                            setSortColumnKey={this.setSortColumnKey}
                        />
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
            if(this.state.clickCount === 0) {
                this.setState({clickCount: 1});
                this._doubleClickTimeout = setTimeout(
                    () => this.setState({clickCount: 0}), 250
                );
            }
            else {
                this.setState({clickCount: 0});
                clearTimeout(this._doubleClickTimeout);

                this.props.onRowClick(rowData);
            }
        }
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

        this.setState({
            sortColumnKey: newSortColumnKey,
            sortOrder: newSortOrder,
        });
    },
});
