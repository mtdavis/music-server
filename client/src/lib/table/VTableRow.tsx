import React from 'react';
import {TableRow} from '@mui/material';
import {Theme} from '@mui/material/styles';
import {makeStyles} from '@mui/styles';
import classnames from 'classnames';


const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    display: 'flex',
    boxSizing: 'border-box' as const,
  },
  clickable: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
}));

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
  const classes = useStyles();

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
      className={classnames(
        classes.tableRow,
        {[classes.clickable]: onRowClick}
      )}
      component='div'
      sx={{
        display: 'flex',
        width: '100%',
      }}
      onClick={handleClick}
    />
  );
};

export default VTableRow;
