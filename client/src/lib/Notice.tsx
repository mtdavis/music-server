import React from 'react';
import {
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {Theme} from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  notice: {
    padding: theme.spacing(2),
  },
}));

interface Props {
  children: React.ReactNode;
  elevation?: number,
  loading?: boolean;
}

const Notice = ({
  children,
  elevation,
  loading=false
}: Props): React.ReactElement => {
  const classes = useStyles();

  return (
    <Paper className={classes.notice} elevation={elevation}>
      <Grid container direction='row' spacing={2} alignItems='center'>
        {loading &&
          <Grid item>
            <CircularProgress disableShrink />
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
