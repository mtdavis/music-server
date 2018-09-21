import React, {Component} from 'react';
import {inject} from 'mobx-react';
import {
  Button
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

@inject('dbStore')
export default class ScanPage extends Component {
  render() {
    const {dbStore} = this.props;
    return (
      <div className='scan-page container-fluid'>
        <div className="row">
          <div className="col-xs-12" style={{textAlign:"center"}}>
            <Button variant='contained' color='primary' onClick={dbStore.scanForNewFiles}>
              <SearchIcon />
              Scan for New Files
            </Button>
            <br />
            <br />
            <Button variant='contained' color='primary' onClick={dbStore.scanForChangedMetadata}>
              <SearchIcon />
              Scan for Changed Metadata
            </Button>
            <br />
            <br />
            <Button variant='contained' color='primary' onClick={dbStore.scanForMovedFiles}>
              <SearchIcon />
              Scan for Moved Files
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
