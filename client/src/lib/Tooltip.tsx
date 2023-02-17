import React from 'react';
const muiTooltipPromise = import('@mui/material/Tooltip');
import {TooltipProps} from '@mui/material';

const Tooltip = ({
  children,
  ...rest
}: TooltipProps): React.ReactElement => {
  const MUITooltip = React.lazy(() => muiTooltipPromise);
  // return <MUITooltip>{children}</MUITooltip>
  return (
    <React.Suspense fallback={children}>
      <MUITooltip {...rest}>
        {children}
      </MUITooltip>
    </React.Suspense>
  );
};

export default Tooltip;
