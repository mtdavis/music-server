import React from 'react';

import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

const useStyles = makeStyles(() => ({
  page: {
    height: '100%',
    maxHeight: 'calc(100vh - 96px)',
    width: '100%',
    maxWidth: '100%',
  },
  card: {
    height: '100%',
    maxHeight: '100%',
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flex: 1,
    overflow: 'scroll',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
  },
  scanResult: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    whiteSpace: 'pre',
  },
}));

const ScanPage = (): React.ReactElement => {
  const { dbStore } = useStores();
  const classes = useStyles();

  const onScan = () => {
    dbStore.scan({ dryRun: false });
  };

  const onDryRun = () => {
    dbStore.scan({ dryRun: true });
  };

  return (
    <div className={classes.page}>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          {dbStore.scanning ? (
            <div className={classes.spinner}>
              <CircularProgress />
            </div>
          ) : (
            <Typography className={classes.scanResult}>
              {dbStore.scanResult}
            </Typography>
          )}
        </CardContent>

        <Divider />

        <CardActions className={classes.actions}>
          <Button
            color='primary'
            onClick={onDryRun}
            disabled={dbStore.scanning}
            startIcon={<SearchIcon />}
          >
            Dry Run
          </Button>
          <Button
            color='secondary'
            onClick={onScan}
            disabled={dbStore.scanning}
            startIcon={<CreateIcon />}
          >
            Scan and Commit
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default observer(ScanPage);
