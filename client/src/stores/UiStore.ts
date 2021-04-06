import {
  action,
  makeObservable,
  observable,
} from 'mobx';

export default class UiStore {
  drawerOpen = false;

  constructor() {
    makeObservable(this, {
      drawerOpen: observable,
      openDrawer: action,
      closeDrawer: action,
      toggleDrawer: action,
    });
  }

  openDrawer: () => void = () => {
    this.drawerOpen = true;
  }

  closeDrawer: () => void = () => {
    this.drawerOpen = false;
  }

  toggleDrawer: () => void = () => {
    this.drawerOpen = !this.drawerOpen;
  }
}
