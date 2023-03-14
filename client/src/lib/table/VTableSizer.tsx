import React from 'react';

import useBoundingClientRect from 'hooks/useBoundingClientRect';

interface Props {
  children: React.ReactNode;
  listHeight: number;
  showHeader: boolean;
  rowCount: number;
}

const VTableSizer = ({
  children,
  listHeight,
  showHeader,
  rowCount,
}: Props): React.ReactElement => {
  const ref = React.useRef(null);
  const { y } = useBoundingClientRect(ref) ?? { y: 0 };

  let minHeight;

  if (rowCount > 0) {
    minHeight = listHeight;
  } else if (showHeader) {
    minHeight = 100;
  } else {
    minHeight = 50;
  }

  return (
    <div
      ref={ref}
      style={{
        height: `min(${minHeight}px, max(calc(100vh - ${y + 16}px), 200px))`,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default VTableSizer;
