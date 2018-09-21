import React from 'react';
import PropTypes from 'prop-types';
import {TextField, Chip} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

import AutoComplete from './AutoComplete';

const styles = {
  chip: {
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  wrapper: {
    display: 'flex',
  },
  autoCompleteWrapper: {
    width: 300,
  },
}

@withStyles(styles)
class MultiSelectAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
      currentSelectedValue: null,
    };
  }

  render() {
    const classes = this.props.classes;
    const chips = this.state.selectedItems.map(this.renderChip);

    let {options} = this.props;
    if(options.indexOf(null) !== -1) {
      options = options.slice();
      options.splice(options.indexOf(null), 1); // remove null
      options.splice(0, 0, '(None)');
    }

    return (
      <div className={classes.wrapper}>
        <div className={classes.autoCompleteWrapper}>
          <AutoComplete
            hintText={this.props.hintText}
            options={options}
            value={this.state.currentSelectedValue}
            onChange={this.selectItem} />
        </div>

        {chips}
      </div>
    );
  }

  renderChip = (item) => {
    const {classes} = this.props;
    return (
      <Chip
        key={item}
        label={item || '(None)'}
        className={classes.chip}
        onDelete={() => this.deselectItem(item)} />
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

  selectItem = (item) => {
    if(item === '(None)') {
      item = null;
    }

    if(this.props.options.includes(item) &&
      !this.state.selectedItems.includes(item)) {

      const selectedItems = this.state.selectedItems.slice();
      selectedItems.push(item);
      this.setState({
        selectedItems,
        currentSelectedValue: null,
      });

      if(this.props.onSelectedItemsUpdate) {
        this.props.onSelectedItemsUpdate(selectedItems);
      }
    }
  }
}

MultiSelectAutoComplete.propTypes = {
  hintText: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectedItemsUpdate: PropTypes.func
};

export default MultiSelectAutoComplete;
