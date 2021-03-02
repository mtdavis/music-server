import React from 'react';
import PropTypes from 'prop-types';
import {
  colors,
} from '@material-ui/core';
import TableCell, {TableCellProps} from '@material-ui/core/TableCell';
import {withStyles} from '@material-ui/core/styles';

import SortIcon from './SortIcon';

interface Column {
  key: string,

  header: string,

  textAlign: 'left' | 'right',
};

interface Props extends TableCellProps {
  column: Column,

  sortingActive: boolean,

  sortOrder: 1 | -1,

  setSortColumnKey: (key: string) => void,

  classes: {
    cell: string,
    div: string,
  },
};

interface State {
  hover: boolean,
};

const styles = {
  cell: {
    padding: 0,
    // position: 'relative',
    height: 56,
    '&:last-child': {
      paddingRight: 0,
    },
  },
  div: {
    height: '100%',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    cursor: 'pointer',
    justifyContent: 'flex-start',
    userSelect: 'none',
  },
};

@withStyles(styles)
class MTableHeaderColumn extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hover: false
    };
  }

  render() {
    const {classes, column, sortingActive, sortOrder, setSortColumnKey, ...props} = this.props;

    return (
      <TableCell {...props} classes={{'root': classes.cell}}>
        <div
          onClick={() => setSortColumnKey(column.key)}
          onMouseEnter={this.onMouseEnter.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          style={{
            color: sortingActive ? 'rgba(0, 0, 0, 0.87)' : undefined,
            backgroundColor: this.state.hover ? colors.grey['100'] : undefined,
            flexDirection: column.textAlign==='right' ? 'row-reverse' : 'row',
          }}
          className={classes.div}>
          <div style={{order: 1}}>
            {column.header}
          </div>
          <div style={{order: 2}}>
            <SortIcon
              hover={this.state.hover}
              sortingActive={sortingActive}
              sortOrder={sortOrder} />
          </div>
        </div>
      </TableCell>
    );
  }

  onMouseEnter() {
    this.setState({hover: true});
  }

  onMouseLeave() {
    this.setState({hover: false});
  }
}

export default MTableHeaderColumn;
