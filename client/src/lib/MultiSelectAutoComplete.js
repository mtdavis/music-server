import React, {PropTypes} from 'react';
import {AutoComplete, Chip} from 'material-ui';

function filter(searchText, key) {
  return searchText === '' ||
    key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
}

class MultiSelectAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      selectedItems: []
    };
  }

  render() {
    const chips = this.state.selectedItems.map(this.renderChip.bind(this));

    let {dataSource} = this.props;
    if(dataSource.indexOf(null) !== -1) {
      dataSource = dataSource.slice();
      dataSource.splice(dataSource.indexOf(null), 1); // remove null
      dataSource.splice(0, 0, '(None)');
    }

    return (
      <div style={{layout: 'flex'}}>
        <AutoComplete
          filter={filter}
          popoverProps={{
            zDepth: 2,
            useLayerForClickAway: true
          }}
          menuStyle={{
            maxHeight: '60vh',
            overflowY: 'scroll'
          }}
          hintText={this.props.hintText}
          menuCloseDelay={0}
          openOnFocus={true}
          dataSource={dataSource}
          searchText={this.state.searchText}
          onUpdateInput={this.handleUpdateInput.bind(this)}
          onNewRequest={this.selectItem.bind(this)} />

        {chips}
      </div>
    );
  }

  handleUpdateInput(searchText) {
    this.setState({searchText});
  }

  renderChip(item) {
    const style = {
      verticalAlign: 'middle',
      display: 'inline-block',
      marginLeft: 8,
      marginTop: 4,
      marginBottom: 4,
    };
    const labelStyle = {
      verticalAlign: 'top'
    };
    return (
      <Chip
        key={item}
        style={style}
        labelStyle={labelStyle}
        onRequestDelete={() => this.deselectItem(item)}>
        {item || '(None)'}
      </Chip>
    );
  }

  deselectItem(item) {
    if(item === '(None)') {
      item = null;
    }

    const index = this.state.selectedItems.indexOf(item);
    if(index !== -1) {
      const selectedItems = this.state.selectedItems.slice();
      selectedItems.splice(index, 1);
      this.setState({selectedItems});

      if(this.props.onSelectedItemsUpdate) {
        this.props.onSelectedItemsUpdate(selectedItems);
      }
    }

  }

  selectItem(item) {
    if(item === '(None)') {
      item = null;
    }

    if(this.props.dataSource.includes(item) &&
      !this.state.selectedItems.includes(item)) {

      const selectedItems = this.state.selectedItems.slice();
      selectedItems.push(item);
      this.setState({
        selectedItems,
        searchText: ''
      });

      if(this.props.onSelectedItemsUpdate) {
        this.props.onSelectedItemsUpdate(selectedItems);
      }
    }
  }
}

MultiSelectAutoComplete.propTypes = {
  hintText: PropTypes.string.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectedItemsUpdate: PropTypes.func
};

export default MultiSelectAutoComplete;
