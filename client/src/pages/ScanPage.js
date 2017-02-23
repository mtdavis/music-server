import React from 'react';
import AlbumList from '../lib/AlbumList';
import {FluxMixin} from '../lib/util';
import {
  FontIcon,
  RaisedButton
} from 'material-ui';

module.exports = React.createClass({
  mixins: [FluxMixin],

  render: function () {
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
