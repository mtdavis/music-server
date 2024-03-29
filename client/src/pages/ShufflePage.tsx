import React from 'react';

import {
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import ShuffleVariantIcon from 'mdi-material-ui/ShuffleVariant';
import { useStores } from 'stores';

const ROCK_ETC = [
  'Blues Rock',
  'Classic Rock',
  'Grunge',
  'Hard Rock',
  'Heavy Metal',
  'Indie Rock',
  'Psychedelic Rock',
  'Rock',
  'Stoner Rock',
];

const NON_ROCK = [
  'Alternative',
  'Classical',
  'Comedy',
  'Country',
  'Electronic',
  'Folk',
  'Funk',
  'Game',
  'Hip Hop',
  'Jazz',
  'Pop',
  'Punk',
  'Soul',
  'Soundtrack',
  'Swing',
  'Trip Hop',
];

const ShufflePage = (): React.ReactElement => {
  const { musicStore } = useStores();
  const [duration, setDuration] = React.useState(30);
  const [genres, setGenres] = React.useState(['*']);

  const onShuffle = () => {
    musicStore.playShuffle(duration, genres);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        alignItems: 'center',
      }}
    >
      <Card sx={{ width: 200 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label='Duration'
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              >
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={60}>60 minutes</MenuItem>
                <MenuItem value={90}>90 minutes</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label='Genre'
                value={JSON.stringify(genres)}
                onChange={(event) => setGenres(JSON.parse(event.target.value))}
              >
                <MenuItem value={JSON.stringify(['*'])}>Any</MenuItem>
                <MenuItem value={JSON.stringify(ROCK_ETC)}>Rock, etc.</MenuItem>
                <MenuItem value={JSON.stringify(NON_ROCK)}>Everything else</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />

        <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button color='primary' onClick={onShuffle} startIcon={<ShuffleVariantIcon />}>
            Play Shuffle
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default ShufflePage;
