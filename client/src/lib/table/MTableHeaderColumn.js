import React from 'react';
import {
  TableHeaderColumn,
} from 'material-ui';
import {colors} from 'material-ui/styles';
import SortIcon from './SortIcon';

class MTableHeaderColumn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hover: false
    };
  }

  render() {
    var {column, sortingActive, sortOrder, setSortColumnKey, ...props} = this.props;

    let divStyle = {
      color: sortingActive ? colors.darkBlack : undefined,
      backgroundColor: this.state.hover ? colors.grey100 : undefined,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      cursor: 'pointer',
      justifyContent: 'flex-start',
      flexDirection: column.textAlign==='right' ? 'row-reverse' : 'row',
      userSelect: 'none',
    };

    return (
      <TableHeaderColumn {...props} style={{padding: 0}}>
        <div
          onClick={() => setSortColumnKey(column.key)}
          onMouseEnter={this.onMouseEnter.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          style={divStyle}>
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
      </TableHeaderColumn>
    );
  }

  onMouseEnter() {
    this.setState({hover: true});
  }

  onMouseLeave() {
    this.setState({hover: false});
  }
}

MTableHeaderColumn.muiName = 'TableHeaderColumn';

export default MTableHeaderColumn;
