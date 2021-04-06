import React from 'react';
import {
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';
import {Theme} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  notice: {
    padding: theme.spacing(2),
  },
}));

interface Props {
  children: React.ReactNode;
  loading?: boolean;
}

const Notice = ({
  children,
  loading=false
}: Props): React.ReactElement => {
  const classes = useStyles();

  return (
    <Paper className={classes.notice}>
      <Grid container direction='row' spacing={2} alignItems='center'>
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
};

export default Notice;
