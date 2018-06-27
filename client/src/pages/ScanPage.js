import React, {Component} from 'react';
import {inject} from 'mobx-react';
import {
  FontIcon,
  RaisedButton
} from 'material-ui';

@inject('dbStore')
export default class ScanPage extends Component {
  render() {
    const {dbStore} = this.props;
    return (
      <div className='scan-page container-fluid'>
        <div className="row">
          <div className="col-xs-12" style={{textAlign:"center"}}>
            <RaisedButton
              primary={true}
              onClick={dbStore.scanForNewFiles}
              label="Scan for New Files"
              icon={<FontIcon className="icon-search"/>} />
            <br />
            <br />
            <RaisedButton
              primary={true}
              onClick={dbStore.scanForChangedMetadata}
              label="Scan for Changed Metadata"
              icon={<FontIcon className="icon-search"/>} />
            <br />
            <br />
            <RaisedButton
              primary={true}
              onClick={dbStore.scanForMovedFiles}
              label="Scan for Moved Files"
              icon={<FontIcon className="icon-search"/>} />
          </div>
        </div>
      </div>
    );
  }
}
