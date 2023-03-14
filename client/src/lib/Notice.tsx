import React from 'react';

import {
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';

interface Props {
  children: React.ReactNode;
  elevation?: number,
  loading?: boolean;
}

const Notice = ({
  children,
  elevation,
  loading = false,
}: Props): React.ReactElement => (
  <Paper sx={{ padding: 2 }} elevation={elevation}>
    <Grid container direction='row' spacing={2} alignItems='center'>
      {loading && (
        <Grid item>
          <CircularProgress disableShrink />
        </Grid>
      )}

      <Grid item>
        <Typography variant='body2'>
          {children}
        </Typography>
      </Grid>
    </Grid>
  </Paper>
);

export default Notice;
