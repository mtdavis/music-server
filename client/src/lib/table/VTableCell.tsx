import React from 'react';

import {
  TableCell,
} from '@mui/material';

interface Props<R extends RowData> {
  children: React.ReactNode;
  column: ColumnConfig<R>;
  flexBasis?: number,
}

const VTableCell = <R extends RowData>({
  children,
  column,
  flexBasis,
}: Props<R>): React.ReactElement => (
  <TableCell
    component='div'
    sx={{
      alignItems: 'center',
      display: 'flex',
      flexBasis: `${flexBasis}%`,
      flexGrow: column.fixedWidth ? 0 : 1,
      flexShrink: column.fixedWidth ? 0 : 1,
      fontSize: '0.8rem',
      height: 50,
      paddingBottom: 0,
      paddingTop: 0,
      whiteSpace: 'normal',
      width: column.fixedWidth,
    }}
    align={column.align}
  >
    {children}
  </TableCell>
  );

export default VTableCell;
