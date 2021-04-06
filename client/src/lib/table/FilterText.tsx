import React from 'react';
import {observer} from 'mobx-react-lite';
import debounce from 'debounce';
import {
  TextField,
} from '@material-ui/core';

import FilterStore from './FilterStore';

type TextFieldChangeEvent =
  React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> |
  React.KeyboardEvent<HTMLDivElement>;

interface Props<R extends RowData> {
  filterStore: FilterStore<R>;
}

function FilterText<R extends RowData>({
  filterStore,
}: Props<R>): React.ReactElement {
  const delayedOnTextFilterChange = debounce((event: TextFieldChangeEvent) => {
    filterStore.setFilterText((event.target as HTMLInputElement).value);
  }, 200);

  const onTextFilterChange = (event: TextFieldChangeEvent) => {
    event.persist();
    delayedOnTextFilterChange(event);
  };

  return (
    <TextField
      fullWidth
      placeholder="Text or query..."
      error={!filterStore.filterTextValid}
      onChange={onTextFilterChange}
      onKeyUp={onTextFilterChange}
    />
  );
}

export default observer(FilterText);
