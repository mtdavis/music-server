import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  SvgIcon,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  makeStyles
} from '@mui/styles';
import {useLocation, useNavigate} from "react-router-dom";

import Tooltip from 'lib/Tooltip';
import {useStores} from 'stores';

const useStyles = makeStyles(() => ({
  tooltipPlacementRight: {
    position: 'relative' as const,
    left: -200,
  },
}));

interface Props {
  Icon: typeof SvgIcon,
  to: string,
  children: string,
}

const LinkMenuItem = ({
  Icon,
  to,
  children,
}: Props) => {
  const classes = useStyles();
  const {uiStore} = useStores();
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = () => {
    if(location.pathname !== to) {
      navigate(to);
    }
  };

  return (
    <Tooltip
      placement='right'
      title={uiStore.drawerOpen ? '' : children}
      disableFocusListener
      classes={classes}
    >
      <ListItem button onClick={onClick}>
        <ListItemIcon>
          <Icon color={location.pathname === to ? 'primary' : undefined} />
        </ListItemIcon>
        <ListItemText>
          {children}
        </ListItemText>
      </ListItem>
    </Tooltip>
  );
};

export default observer(LinkMenuItem);
