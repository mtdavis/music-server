import React from 'react';
import {observer} from 'mobx-react-lite';
import {
  TextField,
} from '@material-ui/core';

import {FilterStore} from './FilterStore';

interface Props<R extends RowData> {
  filterStore: FilterStore<R>;
}

function FilterText<R extends RowData>({
  filterStore,
}: Props<R>): React.ReactElement {
  const onChange = (event: TextFieldChangeEvent) => {
    filterStore.filterText = (event.target as HTMLInputElement).value;
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
