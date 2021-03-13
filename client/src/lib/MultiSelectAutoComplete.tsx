import React from 'react';
import PropTypes from 'prop-types';
import {
  Chip,
  Grid,
} from '@material-ui/core';

import AutoComplete from './AutoComplete';

interface Props {
  hintText: string;
  options: (string | null)[];
  onSelectedItemsUpdate: (items: (string | null)[]) => void;
}

interface State {
  selectedItems: (string | null)[];
  currentSelectedValue: string | null;
}

class MultiSelectAutoComplete extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedItems: [],
      currentSelectedValue: null,
    };
  }

  render() {
    const chips = this.state.selectedItems.map(this.renderChip);

    let {options} = this.props;
    if(options.indexOf(null) !== -1) {
      options = options.slice();
      options.splice(options.indexOf(null), 1); // remove null
      options.splice(0, 0, '(None)');
    }

    return (
      <Grid container direction='column' spacing={8}>
        <Grid item>
          <AutoComplete
            hintText={this.props.hintText}
            options={options}
            value={this.state.currentSelectedValue}
            onChange={this.selectItem} />
        </Grid>

        <Grid item>
          <Grid container direction='row' spacing={8}>
            {chips}
          </Grid>
        </Grid>
      </Grid>
    );
  }

  renderChip = (item: string | null) => (
    <Grid item key={item || '(None)'}>
      <Chip
        label={item || '(None)'}
        onDelete={() => this.deselectItem(item)}
      />
    </Grid>
  )

  deselectItem(item: string | null) {
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

  selectItem = (item: string | null) => {
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

export default MultiSelectAutoComplete;
