import React from 'react';
import classNames from 'classnames';
import TableCell from '@material-ui/core/TableCell';
import {
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import {renderIcon} from './util';

const styles = () => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box' as 'border-box',
  },
  tableCell: {
    flex: 1,
  },
  icon: {
    paddingLeft: 12,
    paddingRight: 12,
    '&:last-child': {
      paddingRight: 12,
    },
  },
});

export const renderValue = (
  value: any,
  column: ColumnConfig
): string => {
  let renderedValue = value;

  if(value === null || value === undefined) {
    renderedValue = '-';
  }
  else if(column.renderer) {
    renderedValue = column.renderer(value);
  }

  return renderedValue;
};

interface Props extends WithStyles<typeof styles> {
  value: any;
  column: ColumnConfig;
  rowHeight: number;
}

class VTableCell extends React.Component<Props> {
  render() {
    const {value, column, rowHeight, classes} = this.props;

    const renderedValue = renderValue(value, column);

    return (
      <TableCell
        component="div"
        className={classNames(classes.tableCell, classes.flexContainer, {
          [classes.icon]: column.renderer === renderIcon,
        })}
        variant="body"
        style={{
          height: rowHeight,
          whiteSpace: column.wrap === false ? 'nowrap': 'normal',
        }}
        align={column.align}
      >
        {renderedValue}
      </TableCell>
    );
  }
}

export default withStyles(styles)(VTableCell);
