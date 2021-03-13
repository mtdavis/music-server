import {action, observable} from 'mobx';

export default class UiStore {
  @observable drawerOpen = false;

  @action
  openDrawer = () => {
    this.drawerOpen = true;
  }

  @action
  closeDrawer = () => {
    this.drawerOpen = false;
  }

  @action
  toggleDrawer = () => {
    this.drawerOpen = !this.drawerOpen;
  }
}
