import React from 'react';
import {Paper, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';

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

export default BumpTooltip;
