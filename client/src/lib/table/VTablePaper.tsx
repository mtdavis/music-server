import React from 'react';
import Paper from '@mui/material/Paper';
import useBoundingClientRect from 'hooks/useBoundingClientRect';

interface Props {
  children: React.ReactNode;
}

const VTablePaper = ({
  children,
}: Props): React.ReactElement => {
  const ref = React.useRef(null);
  const {y} = useBoundingClientRect(ref) ?? {y: 0};

  return (
    <Paper
      ref={ref}
      style={{
        height: `max(calc(100vh - ${y + 16}px), 200px)`,
        width: '100%',
      }}
    >
      {children}
    </Paper>
  );
};

export default VTablePaper;
