import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  Grid,
  Paper,
  Typography,
} from '@mui/material';

import {useStores} from 'stores';
import FilterSelect from './FilterSelect';
import FilterText from './FilterText';
import VTable, {Props as BaseVTableProps} from './VTable';

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
    <Paper sx={{padding: 2}}>
      <Grid container spacing={2}>
        {selectElems.length > 0 && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {selectElems}
            </Grid>
          </Grid>
        )}

        <Grid item xs={12}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item sx={{flex: 1}}>
              <FilterText filterStore={filterStore} />
            </Grid>
            <Grid item>
              <Typography variant='body2'>
                {numRows} item{numRows === 1 ? '' : 's'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Grid container direction='column' spacing={2}>
      <Grid item>
        {filterBox}
      </Grid>

      <Grid item>
        <VTable
          {...VTableProps}
          id={id}
          rows={rows}
          columns={columns}
          hiddenRowIds={filterStore.hiddenRowIds}
        />
      </Grid>
    </Grid>
  );
}

export default observer(FilteredTable);
