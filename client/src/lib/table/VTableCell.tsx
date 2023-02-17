import React from 'react';
import classNames from 'classnames';
import {
  TableCell,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {renderIcon} from './util';

const useStyles = makeStyles(() => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box' as const,
  },
  tableCell: {
    flex: 1,
    fontSize: '0.8rem',
  },
  icon: {
    paddingLeft: 12,
    paddingRight: 12,
    '&:last-child': {
      paddingRight: 12,
    },
  },
}));

export function renderValue<R extends RowData>(
  value: RowDataValue,
  rowData: R,
  column: ColumnConfig<R>,
  icons?: {[key: string]: React.ReactNode},
): number | string | React.ReactNode {
  let renderedValue: number | string | React.ReactNode;

  if(value === null) {
    renderedValue = '';
  }
  else if(column.renderer === renderIcon && icons && icons[value]) {
    renderedValue = icons[value];
  }
  else if(column.renderer) {
    renderedValue = column.renderer(value, rowData);
  }
  else {
    renderedValue = value;
  }

  return renderedValue;
}

interface Props<R extends RowData> {
  value: RowDataValue;
  rowData: R;
  column: ColumnConfig<R>;
  rowHeight: number;
  icons?: {[key: string]: React.ReactElement};
}

function VTableCell<R extends RowData>({
  value,
  rowData,
  column,
  rowHeight,
  icons = {},
}: Props<R>): React.ReactElement {
  const classes = useStyles();

  const renderedValue = renderValue(value, rowData, column, icons);

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
      size="small"
    >
      {renderedValue}
    </TableCell>
  );
}

export default VTableCell;
