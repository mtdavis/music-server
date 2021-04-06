import React from 'react';
import {observer} from 'mobx-react-lite';

import FilterStore from './FilterStore';
import MultiSelectAutoComplete from 'lib/MultiSelectAutoComplete';

interface Props<R extends RowData> {
  filterStore: FilterStore<R>;
  filterKey: keyof R;
}

function FilterSelect<R extends RowData>({
  filterStore,
  filterKey,
}: Props<R>): React.ReactElement {
  const hint = (filterKey as string).charAt(0).toUpperCase() +
    (filterKey as string).substring(1).replace(/_/g, ' ') +
    '...';

  return (
    <MultiSelectAutoComplete
      options={filterStore.availableOptions.get(filterKey) || []}
      hintText={hint}
      onSelectedItemsUpdate={selectedItems =>
        filterStore.setSelectedItems(filterKey, selectedItems)
      }
    />
  );
}

export default observer(FilterSelect);
