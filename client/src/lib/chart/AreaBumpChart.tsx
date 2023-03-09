import React from 'react';
import {useTheme} from '@mui/material/styles';
import {
  AreaBumpDatum,
  AreaBumpSerieExtraProps,
  AreaBumpSvgProps,
  ResponsiveAreaBump,
} from '@nivo/bump';
import Tooltip from './bump/Tooltip';
import {COLORS} from './util';

const AreaBumpChart = (
  props: Omit<AreaBumpSvgProps<AreaBumpDatum, AreaBumpSerieExtraProps>, 'width' | 'height'>,
) => {
  const theme = useTheme();

  return (
    <ResponsiveAreaBump
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

      tooltip={Tooltip}

      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}

      {...props}
    />
  );
};

export default AreaBumpChart;
