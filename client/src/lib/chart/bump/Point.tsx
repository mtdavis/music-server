import React, { SVGAttributes } from 'react';

import { BumpDatum, BumpPoint } from '@nivo/bump';
import { useMotionConfig } from '@nivo/core';
import { useSpring, animated, to } from '@react-spring/web';

import type { BumpSerieExtraProps } from '../util';

const pointStyle: SVGAttributes<SVGCircleElement>['style'] = { pointerEvents: 'none' };

interface PointProps {
  point: BumpPoint<BumpDatum, BumpSerieExtraProps>
}

const Point = ({
  point,
}: PointProps) => {
  const { animate, config: springConfig } = useMotionConfig();

  const animatedProps = useSpring<{
    x: number
    y: number
    radius: number
    color: string
    borderWidth: number
  }>({
    x: point.x,
    y: point.y,
    radius: point.size / 2,
    color: point.color,
    borderWidth: point.borderWidth,
    config: springConfig,
    immediate: !animate,
  });

  if (point.serie.data.hidden) {
    return null;
  }

  return (
    <animated.circle
      data-testid={`point.${point.serie.id}.${point.data.x}`}
      cx={animatedProps.x}
      cy={animatedProps.y}
      r={to(animatedProps.radius, (v) => Math.max(v, 0))}
      fill={animatedProps.color}
      strokeWidth={animatedProps.borderWidth}
      stroke={point.borderColor}
      style={pointStyle}
    />
  );
};

export default Point;
