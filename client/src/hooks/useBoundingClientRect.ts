import React from 'react';

const useBoundingClientRect = (target: React.RefObject<HTMLElement>) => {
  const [rect, setRect] = React.useState<DOMRect>();

  React.useLayoutEffect(() => {
    setRect(target.current?.getBoundingClientRect());
  }, [target]);
  return rect;
};

export default useBoundingClientRect;
