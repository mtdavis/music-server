import React from 'react';
import {toJS} from 'mobx';
import {observer} from 'mobx-react-lite';
import {
  AppBar,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Tabs,
  Tab,
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import {Theme, useTheme} from '@material-ui/core/styles';
import {makeStyles} from '@material-ui/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
  ResponsiveAreaBump,
  ResponsiveBump
} from '@nivo/bump';

import {useStores} from 'stores';
import {StatsState} from 'stores/StatsStore';

const useStyles = makeStyles((theme: Theme) => ({
  page: {
    width: '100%',
    minHeight: 'calc(100vh - 96px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paper: {
    height: 'calc(100vh - 144px)',
    width: '100%',
    display: 'flex',
    padding: theme.spacing(2),
    boxSizing: 'border-box',
  },
  chartWrapper: {
    flex: 1,
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const COLORS = [
  Colors.red[700],
  Colors.orange[700],
  Colors.green[700],
  Colors.blue[700],
  Colors.deepPurple[700],
  Colors.pink[300],
  Colors.amber[300],
  Colors.lightGreen[300],
  Colors.lightBlue[300],
  Colors.purple[300],
];

const GenresOverTime = observer(() => {
  const {statsStore} = useStores();
  const theme = useTheme();

  return (
    <ResponsiveAreaBump
      data={toJS(statsStore.genresOverTime)}
      margin={{top: 32, right: 120, bottom: 40, left: 40}}
      spacing={16}

      colors={COLORS}
      inactiveBorderWidth={1}
      inactiveBorderOpacity={0.15}
      endLabelTextColor={{'from':'color'}}

      axisTop={null}
      axisBottom={{
        tickSize: 0,
      }}

      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}
    />
  );
});

const ArtistsOverTime = observer(() => {
  const {statsStore} = useStores();
  const theme = useTheme();

  return (
    <ResponsiveBump
      data={toJS(statsStore.artistsOverTime)}
      margin={{top: 32, right: 200, bottom: 40, left: 40}}

      colors={COLORS}

      axisTop={null}
      axisBottom={{
        tickSize: 0,
      }}
      axisLeft={{
        tickSize: 0,
      }}

      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}
    />
  );
});

const StatsPage = (): React.ReactElement => {
  const {statsStore} = useStores();
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = React.useState(0);

  React.useEffect(() => {
    if(statsStore.state === StatsState.NOT_LOADED) {
      statsStore.loadStats();
    }
  }, [statsStore]);

  if(statsStore.state === StatsState.NOT_LOADED) {
    return (
      <div className={classes.page}>
        <CircularProgress disableShrink />
      </div>
    );
  }

  const SelectedTabComponent = {
    0: GenresOverTime,
    1: ArtistsOverTime,
  }[selectedTab] as React.ComponentType;

  return (
    <div className={classes.page}>
      <AppBar position='static' color="default">
        <Grid container direction='row'>
          <Grid item style={{flex: 1}}>
            <Tabs
              value={selectedTab}
              textColor='primary'
              indicatorColor='primary'
              centered
              onChange={(event, newValue) => setSelectedTab(newValue)}
            >
              <Tab label='Genres Over Time' />
              <Tab label='Artists Over Time' />
            </Tabs>
          </Grid>
          <Grid item>
            <IconButton onClick={statsStore.loadStats}>
              <RefreshIcon />
            </IconButton>
          </Grid>
        </Grid>
      </AppBar>

      <Paper square className={classes.paper}>
        <div className={classes.chartWrapper}>
          <SelectedTabComponent />
        </div>
      </Paper>

    </div>
  );
};

export default observer(StatsPage);
