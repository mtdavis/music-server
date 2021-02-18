import {action, observable} from 'mobx';

export default class UiStore {
  @observable drawerOpen: boolean;

  constructor() {
    // automatically show the menu if the initial page is the home page
    this.drawerOpen = window.location.hash === '#/';
  }

  @action
  openDrawer = () => {
    this.drawerOpen = true;
  }

  @action
  closeDrawer = () => {
    this.drawerOpen = false;
  }
}
