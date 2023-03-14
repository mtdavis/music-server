import React from 'react';

import {
  BumpCustomLayerProps,
  BumpDatum,
} from '@nivo/bump';

import Line from './Line';
import Tooltip from './Tooltip';
import { BumpSerieExtraProps } from '../util';

const LinesLayer = ({
  series,
  setActiveSerieIds,
  lineGenerator,
  yScale,
}: BumpCustomLayerProps<BumpDatum, BumpSerieExtraProps>) => (
  <React.Fragment key='lines'>
    {series.map((serie) => (
      serie.data.hidden ? null : (
        <Line<BumpDatum, BumpSerieExtraProps>
          key={serie.id}
          serie={serie}
          setActiveSerieIds={setActiveSerieIds}
          lineGenerator={lineGenerator}
          yStep={yScale.step()}
          isInteractive
          tooltip={Tooltip}
        />
      )
    ))}
  </React.Fragment>
);

export default LinesLayer;
