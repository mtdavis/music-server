import React from 'react';
import {useLocalObservable, observer} from 'mobx-react-lite';
import {
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import {makeStyles} from '@material-ui/styles';

import FilterStore from './FilterStore';
import FilterSelect from './FilterSelect';
import FilterText from './FilterText';

const useStyles = makeStyles(() => ({
  itemCount: {
    marginLeft: 16,
    textAlign: 'right' as const,
  },
  filterBox: {
    padding: 16,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  tableWrapper: {
    flex: 1,
    marginTop: 16,
  },
}));

interface Props<R extends RowData> {
  rows: R[];
  filterKeys: string[];
  columns: ColumnConfig<R>[];
  children: (rows: R[]) => React.ReactNode;
}

function FilteredTable<R extends RowData>({
  rows,
  filterKeys,
  columns,
  children,
}: Props<R>): React.ReactElement {
  const classes = useStyles();

  const filterStore = useLocalObservable(() => new FilterStore(rows, columns, filterKeys));

  React.useEffect(() => {
    filterStore.setBaseRows(rows);
  }, [rows, rows.length]);

  const selectElems: React.ReactNode[] = [];

  const selectWidth = (filterKeys.length <= 4 ? 12 / filterKeys.length : 4) as (1 | 2 | 3 | 4);

  filterKeys.forEach(filterKey => {
    selectElems.push(
      <Grid item xs={12} md={selectWidth} key={filterKey}>
        <FilterSelect
          filterStore={filterStore}
          filterKey={filterKey}
        />
      </Grid>
    );
  });

  const numRows = filterStore.filteredRows.length;

  const filterBox = (
    <Paper className={classes.filterBox}>
      <Grid container spacing={2}>
        {selectElems}

        <Grid item xs={12}>
          <div style={{display: 'flex', alignItems: 'end'}}>
            <div style={{flex: 1}}>
              <FilterText filterStore={filterStore} />
            </div>
            {numRows > 0 &&
              <Typography variant='body2' className={classes.itemCount}>
                {numRows} item{numRows === 1 ? '' : 's'}
              </Typography>
            }
          </div>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <div className={classes.wrapper}>
      {filterBox}

      <div className={classes.tableWrapper}>
        {children(filterStore.filteredRows)}
      </div>
    </div>
  );
}

export default observer(FilteredTable);
