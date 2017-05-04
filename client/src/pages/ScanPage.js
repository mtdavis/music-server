import React from 'react';
import {FluxMixin} from '../lib/util';
import {
  FontIcon,
  RaisedButton
} from 'material-ui';

export default React.createClass({
  mixins: [FluxMixin],

  render() {
    return (
      <div className='scan-page container-fluid'>
        <div className="row">
          <div className="col-xs-12" style={{textAlign:"center"}}>
            <RaisedButton
              primary={true}
              onClick={this.getFlux().actions.scanForNewFiles}
              label="Scan for New Files"
              icon={<FontIcon className="icon-search"/>} />
            <br />
            <br />
            <RaisedButton
              primary={true}
              onClick={this.getFlux().actions.scanForChangedMetadata}
              label="Scan for Changed Metadata"
              icon={<FontIcon className="icon-search"/>} />
            <br />
            <br />
            <RaisedButton
              primary={true}
              onClick={this.getFlux().actions.scanForMovedFiles}
              label="Scan for Moved Files"
              icon={<FontIcon className="icon-search"/>} />
          </div>
        </div>
      </div>
    );
  }
});
