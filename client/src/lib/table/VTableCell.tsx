import React from 'react';
import {
  TableCell,
} from '@mui/material';
import {renderIcon} from './util';

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
  return (
    <TableCell
      component='div'
      sx={{
        alignItems: 'center',
        boxSizing: 'border-box' as const,
        display: 'flex',
        flexBasis,
        flexGrow: column.fixedWidth ? 0 : 1,
        flexShrink: column.fixedWidth ? 0 : 1,
        fontSize: '0.8rem',
        maxHeight: 50,
        whiteSpace: 'normal',
        width: column.fixedWidth,
      }}
      align={column.align}
    >
      {children}
    </TableCell>
  );
}

export default VTableCell;
