import React from 'react';
import {toJS} from 'mobx';
import {observer} from 'mobx-react-lite';
import {
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import {Theme, useTheme} from '@material-ui/core/styles';
import {makeStyles} from '@material-ui/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
  ResponsiveAreaBump,
  ResponsiveBump,
} from '@nivo/bump';
import {
  Point,
  ResponsiveLine,
} from '@nivo/line';

import {useStores} from 'stores';
import {StatsState} from 'stores/StatsStore';

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

interface BumpTooltipProps {
  serie: {
    id: string,
    color: string,
  };
}

const BumpTooltip = ({
  serie
}: BumpTooltipProps) => {
  const theme = useTheme();

  return (
    <Paper style={{padding: theme.spacing(1)}}>
      <Typography>
        <span style={{display: 'inline-block', width: '.75em', height: '.75em', backgroundColor: serie.color}} />
        {' '}
        {serie.id}
      </Typography>
    </Paper>
  );
};

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

      tooltip={BumpTooltip}

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

      tooltip={BumpTooltip}

      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}
    />
  );
});

const AlbumsOverTime = observer(() => {
  const {statsStore} = useStores();
  const theme = useTheme();

  return (
    <ResponsiveBump
      data={toJS(statsStore.filteredAlbumsOverTime)}
      margin={{top: 32, right: 200, bottom: 40, left: 40}}

      colors={COLORS}

      axisTop={null}
      axisBottom={{
        tickSize: 0,
      }}
      axisLeft={{
        tickSize: 0,
      }}

      tooltip={BumpTooltip}

      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}
    />
  );
});

interface LineTooltipProps {
  point: Point;
}

const ListensByYearTooltip = ({
  point
}: LineTooltipProps) => {
  const theme = useTheme();

  return (
    <Paper style={{padding: theme.spacing(1)}}>
      <Typography>
        <strong>{point.data.xFormatted}:</strong>{' '}
        {point.data.y.toLocaleString()} hours
      </Typography>
    </Paper>
  );
};

const ListensByYear = observer(() => {
  const {statsStore} = useStores();
  const theme = useTheme();

  return (
    <ResponsiveLine
      data={toJS(statsStore.listensByYear)}
      margin={{top: 32, right: 48, bottom: 48, left: 48}}

      colors={[Colors.lightBlue['600']]}
      enableArea

      xScale={{
        type: 'time',
        format: '%Y-%m-%d',
        useUTC: false,
        precision: 'year',
      }}
      xFormat="time:%Y"

      axisBottom={{
        tickSize: 0,
        tickValues: 'every 5 years',
        format: '%Y',
        legend: 'Year',
        legendPosition: 'middle',
        legendOffset: 40
      }}
      axisLeft={{
        tickSize: 0,
        legend: 'Hours Listened',
        legendPosition: 'middle',
        legendOffset: -40
      }}

      enableCrosshair={false}
      tooltip={ListensByYearTooltip}
      useMesh={true}

      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}
    />
  );
});

const AlbumFilter = observer(() => {
  const {statsStore} = useStores();

  const onChange = (event: TextFieldChangeEvent) => {
    statsStore.albumFilterText = (event.target as HTMLInputElement).value;
  };

  return (
    <TextField
      fullWidth
      value={statsStore.albumFilterText}
      placeholder="Filter..."
      onChange={onChange}
      onKeyUp={onChange}
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
      <div className={classes.paper}>
        <CircularProgress disableShrink />
      </div>
    );
  }

  const SelectedTabComponent = {
    0: GenresOverTime,
    1: ArtistsOverTime,
    2: AlbumsOverTime,
    3: ListensByYear,
  }[selectedTab] as React.ComponentType;

  const filter = {
    0: null,
    1: null,
    2: <AlbumFilter />,
    3: null,
  }[selectedTab] as React.ReactNode;

  return (
    <Paper className={classes.paper}>
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='row' spacing={1} alignItems='center'>
            <Grid item style={{flex: 1}}>
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
            <Grid item>
              {filter}
            </Grid>
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
            <SelectedTabComponent />
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default observer(StatsPage);
