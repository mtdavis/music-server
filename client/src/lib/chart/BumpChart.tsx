import React from 'react';
import {useTheme} from '@mui/material/styles';
import {
  BumpCustomLayerProps,
  BumpDatum,
  BumpSvgProps,
  ResponsiveBump,
} from '@nivo/bump';
import Tooltip from './bump/Tooltip';
import {Line} from './bump/Line';
import {Point} from './bump/Point';
import {COLORS, BumpSerieExtraProps} from './util';

const BumpChart = (
  props: Omit<BumpSvgProps<BumpDatum, BumpSerieExtraProps>, 'width' | 'height'>,
) => {
  const theme = useTheme();

  const LinesLayer = React.useMemo(() => ({
    series,
    setActiveSerieIds,
    lineGenerator,
    yScale,
  }: BumpCustomLayerProps<BumpDatum, BumpSerieExtraProps>) => (
    <React.Fragment key="lines">
      {series.map(serie => (
        serie.data.hidden ? null : (
          <Line<BumpDatum, BumpSerieExtraProps>
            key={serie.id}
            serie={serie}
            setActiveSerieIds={setActiveSerieIds}
            lineGenerator={lineGenerator}
            yStep={yScale.step()}
            isInteractive={props.isInteractive ?? true}
            onMouseEnter={props.onMouseEnter}
            onMouseMove={props.onMouseMove}
            onMouseLeave={props.onMouseLeave}
            onClick={props.onClick}
            tooltip={props.tooltip ?? Tooltip}
          />
        )
      ))}
    </React.Fragment>
  ), [
    props.isInteractive,
    props.onMouseEnter,
    props.onMouseMove,
    props.onMouseLeave,
    props.onClick,
    props.tooltip,
  ]);

  return (
    <ResponsiveBump
      margin={{top: 32, right: 200, bottom: 40, left: 40}}

      colors={COLORS}

      axisTop={null}
      axisBottom={{
        tickSize: 0,
      }}
      axisLeft={{
        tickSize: 0,
      }}

      tooltip={Tooltip}

      theme={{
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
      }}

      pointComponent={Point}

      layers={[
        'grid',
        'axes',
        'labels',
        LinesLayer,
        'points',
      ]}
      {...props}
    />
  );
};

export default BumpChart;
