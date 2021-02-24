import React from 'react';
import {Icon} from '@material-ui/core';

export default function renderIcon(value: string) {
  return <Icon className={value} />;
}
