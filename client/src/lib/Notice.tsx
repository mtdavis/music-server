import React from 'react';
import {
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import {
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

const styles = (theme: Theme) => ({
  notice: {
    padding: theme.spacing.unit * 2,
  },
});

interface Props extends WithStyles<typeof styles> {
  children: React.ReactNode;
  loading?: boolean;
};

const Notice = ({
  children,
  classes,
  loading=false
}: Props) => (
  <Paper className={classes.notice}>
    <Grid container direction='row' spacing={16} alignItems='center'>
      {loading &&
        <Grid item>
          <CircularProgress />
        </Grid>
      }

      <Grid item>
        <Typography variant='body2'>
          {children}
        </Typography>
      </Grid>
    </Grid>
  </Paper>
);

export default withStyles(styles)(Notice);
