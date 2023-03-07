import React from 'react';
import {TooltipProps} from '@mui/material';
const MUITooltip = React.lazy(() => import('@mui/material/Tooltip'));

const Tooltip = ({
  children,
  ...rest
}: TooltipProps): React.ReactElement => (
  <React.Suspense fallback={children}>
    <MUITooltip {...rest}>
      {children}
    </MUITooltip>
  </React.Suspense>
);

export default Tooltip;
