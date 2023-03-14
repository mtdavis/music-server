import * as Colors from '@mui/material/colors';

export const COLORS = [
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

export interface BumpSerieExtraProps extends Record<string, unknown> {
  hidden?: boolean;
}
