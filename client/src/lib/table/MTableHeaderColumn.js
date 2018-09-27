import React from 'react';
import PropTypes from 'prop-types';
import {
  colors,
  TableCell,
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import SortIcon from './SortIcon';

const styles = {
  cell: {
    padding: 0,
    position: 'relative',
    height: 56,
    '&:last-child': {
      paddingRight: 0,
    },
  },
  div: {
    height: '100%',
    width: '100%',
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
class MTableHeaderColumn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hover: false
    };
  }

  render() {
    const {classes, column, sortingActive, sortOrder, setSortColumnKey, ...props} = this.props;

    const divStyles = {
      color: sortingActive ? 'rgba(0, 0, 0, 0.87)' : undefined,
      backgroundColor: this.state.hover ? colors.grey['100'] : undefined,
      flexDirection: column.textAlign==='right' ? 'row-reverse' : 'row',
    };

    return (
      <TableCell {...props} classes={{'root': classes.cell}}>
        <div
          onClick={() => setSortColumnKey(column.key)}
          onMouseEnter={this.onMouseEnter.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          style={divStyles}
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

MTableHeaderColumn.muiName = 'TableCell';

MTableHeaderColumn.propTypes = {
  column: PropTypes.shape({
    key: PropTypes.string.isRequired,
    header: PropTypes.string,
    textAlign: PropTypes.oneOf(['left', 'right']),
  }).isRequired,

  sortingActive: PropTypes.bool.isRequired,

  sortOrder: PropTypes.oneOf([1, -1]).isRequired,

  setSortColumnKey: PropTypes.func.isRequired,

  ...TableCell.propTypes
};

export default MTableHeaderColumn;
