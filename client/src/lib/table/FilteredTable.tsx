import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import debounce from 'debounce';
import {
  Grid,
  Paper,
  TextField,
  Typography,
} from '@material-ui/core';
import {
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import MultiSelectAutoComplete from '../MultiSelectAutoComplete';
import {rowPassesFilter, getUniqueValues} from './util';

const styles = {
  itemCount: {
    marginLeft: 16,
    textAlign: 'right' as 'right',
  },
  filterBox: {
    padding: 16,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: '100%',
  },
  tableWrapper: {
    flex: 1,
    marginTop: 16,
  },
};

type SelectedFilters = {[key: string]: (string | null)[]};

type TextFieldChangeEvent =
  React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> |
  React.KeyboardEvent<HTMLDivElement>;

interface Props<R extends RowData> extends WithStyles<typeof styles> {
  rows: R[];
  filterKeys: string[];
  columns: ColumnConfig[];
  children: (rows: R[]) => React.ReactNode;
}

interface State {
  selectedFilters: SelectedFilters;
  filterText: string;
}

@observer
class FilteredTable<R extends RowData> extends React.Component<Props<R>, State> {
  constructor(props: Props<R>) {
    super(props);

    const selectedFilters: SelectedFilters = {};
    for(const filterKey of props.filterKeys) {
      selectedFilters[filterKey] = [];
    }

    this.state = {
      selectedFilters,
      filterText: '',
    };
  }

  render() {
    const {classes, filterKeys} = this.props;
    let {rows} = this.props;

    const filterElems: React.ReactNode[] = [];

    filterKeys.forEach(filterKey => {
      const selectedFilters = this.state.selectedFilters[filterKey];

      // first determine the options that have not already been selected
      // or filtered out by a previous filter.
      const filterOptions = getUniqueValues(rows, filterKey).filter(
        val => !selectedFilters.includes(val));

      const hint = filterKey.charAt(0).toUpperCase() +
        filterKey.substring(1).replace(/_/g, ' ') +
        '...';

      const md = (filterKeys.length <= 4 ? 12 / filterKeys.length : 4) as (1 | 2 | 3 | 4);

      filterElems.push(
        <Grid item xs={12} md={md} key={filterKey}>
          <MultiSelectAutoComplete
            options={filterOptions}
            hintText={hint}
            onSelectedItemsUpdate={selectedItems =>
              this.onSelectedFilterChange(filterKey, selectedItems)}
          />
        </Grid>
      );

      // now filter the rows by those selected filters.
      if(selectedFilters.length > 0) {
        rows = rows.filter(rowData =>
          selectedFilters.includes(rowData[filterKey])
        );
      }
    });

    // filter by the text.

    let filterTextValid = true;

    try {
      rows = rows.filter(rowData =>
        rowPassesFilter(rowData, this.state.filterText, this.props.columns)
      );
    }
    catch(ex) {
      filterTextValid = false;
    }

    const filterBox = (
      <Paper className={classes.filterBox}>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <div style={{display: 'flex'}}>
              <div style={{flex: 1}}>
                <TextField
                  fullWidth
                  placeholder="Text or query..."
                  error={!filterTextValid}
                  onChange={this.onTextFilterChange}
                  onKeyUp={this.onTextFilterChange} />
              </div>
              {rows.length > 0 &&
                <Typography variant='body2' className={classes.itemCount}>
                  {rows.length} item{rows.length === 1 ? '' : 's'}
                </Typography>
              }
            </div>
          </Grid>

          {filterElems}
        </Grid>
      </Paper>
    );

    return (
      <div className={classes.wrapper}>
        {filterBox}

        <div className={classes.tableWrapper}>
          {this.props.children(rows)}
        </div>
      </div>
    );
  }

  onTextFilterChange = (event: TextFieldChangeEvent) => {
    event.persist();
    this.delayedOnTextFilterChange(event);
  }

  delayedOnTextFilterChange = debounce((event: TextFieldChangeEvent) => {
    this.setState({
      filterText: (event.target as HTMLInputElement).value
    });
  }, 200)

  onSelectedFilterChange = (filterKey: string, selectedItems: (string | null)[]) => {
    const selectedFilters = Object.assign({}, this.state.selectedFilters);
    selectedFilters[filterKey] = selectedItems.slice();
    this.setState({selectedFilters});
  }
}

export default withStyles(styles)(FilteredTable);
