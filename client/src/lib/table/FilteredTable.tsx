import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {makeStyles} from '@mui/styles';

import {useStores} from 'stores';
import FilterSelect from './FilterSelect';
import FilterText from './FilterText';
import VTable, {Props as BaseVTableProps} from './VTable';

const useStyles = makeStyles(() => ({
  clearButton: {
    marginLeft: 16,
  },
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

type VTableProps<R extends RowData> = Omit<BaseVTableProps<R>, 'id' | 'rows' | 'columns' | 'hiddenRowIds'>;

interface Props<R extends RowData> {
  id: string,
  rows: R[];
  filterKeys: string[];
  columns: ColumnConfig<R>[];
  VTableProps: VTableProps<R>;
}

function FilteredTable<R extends RowData>({
  id,
  rows,
  filterKeys,
  columns,
  VTableProps,
}: Props<R>): React.ReactElement {
  const classes = useStyles();
  const {filterStoreMap} = useStores();
  const filterStore = filterStoreMap.get(id, rows, columns, filterKeys);

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

  const numRows = rows.length - filterStore.hiddenRowIds.size;

  const filterBox = (
    <Paper className={classes.filterBox}>
      <Grid container spacing={2}>
        {selectElems.length > 0 && (
          <Grid item xs={12}>
            <div style={{display: 'flex', alignItems: 'start'}}>
              <div style={{flex: 1}}>
                <Grid container spacing={2}>
                  {selectElems}
                </Grid>
              </div>
            </div>
          </Grid>
        )}

        <Grid item xs={12}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{flex: 1}}>
              <FilterText filterStore={filterStore} />
            </div>
            <Typography variant='body2' className={classes.itemCount}>
              {numRows} item{numRows === 1 ? '' : 's'}
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <div className={classes.wrapper}>
      {filterBox}

      <div className={classes.tableWrapper}>
        <VTable
          {...VTableProps}
          id={id}
          rows={rows}
          columns={columns}
          hiddenRowIds={filterStore.hiddenRowIds}
        />
      </div>
    </div>
  );
}

export default observer(FilteredTable);
