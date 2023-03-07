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
  children: React.ReactNode;
  column: ColumnConfig<R>;
  flexBasis?: string | number,
}

function VTableCell<R extends RowData>({
  children,
  column,
  flexBasis,
}: Props<R>): React.ReactElement {
  const classes = useStyles();

  return (
    <TableCell
      component='div'
      className={classNames(classes.tableCell, classes.flexContainer, {
        [classes.icon]: column.renderer === renderIcon,
      })}
      sx={{
        flexBasis,
        flexGrow: column.fixedWidth ? 0 : 1,
        flexShrink: column.fixedWidth ? 0 : 1,
        whiteSpace: 'normal',
        width: column.fixedWidth,
      }}
      align={column.align}
      size='small'
    >
      {children}
    </TableCell>
  );
}

export default VTableCell;
