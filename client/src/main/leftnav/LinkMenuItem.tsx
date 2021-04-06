import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  SvgIcon,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@material-ui/core';
import {
  makeStyles
} from '@material-ui/styles';
import {useHistory, useLocation} from "react-router-dom";

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
  const history = useHistory();
  const location = useLocation();

  const onClick = () => {
    if(location.pathname !== to) {
      history.push(to);
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
