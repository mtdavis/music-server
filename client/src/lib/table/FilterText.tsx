import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  TextField,
} from '@mui/material';

import {FilterStore} from './FilterStore';

interface Props<R extends RowData> {
  filterStore: FilterStore<R>;
}

function FilterText<R extends RowData>({
  filterStore,
}: Props<R>): React.ReactElement {
  const onChange = (event: TextFieldChangeEvent) => {
    filterStore.setFilterText((event.target as HTMLInputElement).value);
  };

  return (
    <TextField
      fullWidth
      value={filterStore.filterText}
      placeholder="Text or query..."
      error={!filterStore.filterTextValid}
      onChange={onChange}
      onKeyUp={onChange}
    />
  );
}

export default observer(FilterText);
