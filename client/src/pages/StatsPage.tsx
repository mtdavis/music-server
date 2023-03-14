import React from 'react';

import RefreshIcon from '@mui/icons-material/Refresh';
import {
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import AreaBumpChart from 'lib/chart/AreaBumpChart';
import BumpChart from 'lib/chart/BumpChart';
import LineChart from 'lib/chart/LineChart';
import ListensByYearTooltip from 'lib/chart/ListensByYearTooltip';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { StatsState } from 'stores/StatsStore';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: '100%',
    minHeight: 'calc(100vh - 96px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    height: 'calc(100vh - 144px)',
    width: '100%',
    display: 'flex',
    padding: theme.spacing(2),
    boxSizing: 'border-box',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const AlbumFilter = observer(() => {
  const { statsStore } = useStores();

  const onChange = (event: TextFieldChangeEvent) => {
    statsStore.setAlbumFilterText((event.target as HTMLInputElement).value);
  };

  return (
    <TextField
      fullWidth
      value={statsStore.albumFilterText}
      placeholder='Filter...'
      onChange={onChange}
      onKeyUp={onChange}
      size='small'
      variant='standard'
    />
  );
});

const StatsPage = (): React.ReactElement => {
  const { statsStore } = useStores();
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = React.useState(0);

  React.useEffect(() => {
    if (statsStore.state === StatsState.NOT_LOADED) {
      statsStore.loadStats();
    }
  }, [statsStore]);

  if (statsStore.state === StatsState.NOT_LOADED) {
    return (
      <div className={classes.paper}>
        <CircularProgress disableShrink />
      </div>
    );
  }

  return (
    <Paper className={classes.paper}>
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='row' spacing={1} alignItems='center'>
            <Grid item style={{ flex: 1 }}>
              <Tabs
                value={selectedTab}
                textColor='primary'
                indicatorColor='primary'
                onChange={(event, newValue) => setSelectedTab(newValue)}
              >
                <Tab label='Genres Over Time' />
                <Tab label='Artists Over Time' />
                <Tab label='Albums Over Time' />
                <Tab label='Listens By Year' />
              </Tabs>
            </Grid>
            {selectedTab === 2 && (
              <Grid item>
                <AlbumFilter />
              </Grid>
            )}
            <Grid item>
              <IconButton onClick={statsStore.loadStats}>
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <Divider />
        </Grid>

        <Grid item>
          <div className={classes.chartWrapper}>
            {selectedTab === 0 && (
              <AreaBumpChart data={toJS(statsStore.genresOverTime)} />
            )}
            {selectedTab === 1 && (
              <BumpChart data={toJS(statsStore.artistsOverTime)} />
            )}
            {selectedTab === 2 && (
              <BumpChart data={toJS(statsStore.filteredAlbumsOverTime)} />
            )}
            {selectedTab === 3 && (
              <LineChart
                data={toJS(statsStore.listensByYear)}
                tooltip={ListensByYearTooltip}
              />
            )}
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default observer(StatsPage);
