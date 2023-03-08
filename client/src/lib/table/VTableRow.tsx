import React from 'react';
import {colors, TableRow} from '@mui/material';

interface TableRowProps<R extends RowData> {
  item: R,
  onRowClick?: (row: R) => void;
  onRowCtrlClick?: (row: R) => void;
}

const VTableRow = <R extends RowData>({
  item,
  onRowClick,
  onRowCtrlClick,
  ...props
}: TableRowProps<R>) => {
  const handleClick = (event: React.MouseEvent) => {
    if((event.ctrlKey || event.metaKey) && onRowCtrlClick) {
      event.preventDefault();
      onRowCtrlClick(item);
    }
    else if(onRowClick) {
      onRowClick(item);
    }
  };

  return (
    <TableRow
      {...props}
      component='div'
      sx={{
        display: 'flex',
        width: '100%',
        boxSizing: 'border-box' as const,
        cursor: onRowClick ? 'pointer' : undefined,
        '&:hover': {
          backgroundColor: onRowClick ? colors.grey[200] : undefined,
        },
      }}
      onClick={handleClick}
    />
  );
};

export default VTableRow;
