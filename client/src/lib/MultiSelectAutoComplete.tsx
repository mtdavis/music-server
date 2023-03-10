import React from 'react';

import {
  Autocomplete,
  Chip,
  Grid,
  TextField,
} from '@mui/material';

type Item = string | number | null;

type WrappedItem = {
  label: string,
  value: Item,
};

interface Props {
  hintText: string;
  options: Item[];
  selectedItems: Item[];
  onSelectedItemsUpdate: (items: Item[]) => void;
}

const MultiSelectAutoComplete = ({
  hintText,
  options,
  selectedItems,
  onSelectedItemsUpdate,
}: Props): React.ReactElement => {
  const onAutocompleteChange = (event: React.ChangeEvent<unknown>, items: Array<WrappedItem>): void => {
    onSelectedItemsUpdate(items.map((item: WrappedItem) => item.value));
  };

  const wrapItem = (item: Item) => ({
    label: item?.toString() ?? '(None)',
    value: item,
  });

  const wrapOptions = React.useMemo(() => {
    const reordered = options.slice();

    if (reordered.includes(null)) {
      reordered.splice(reordered.indexOf(null), 1); // remove null
      reordered.splice(0, 0, null);
    }

    return reordered.map(wrapItem);
  }, [options]);

  const wrapSelectedItems = selectedItems.map(wrapItem);

  return (
    <Grid container direction='column' spacing={1}>
      <Grid item>
        <Autocomplete
          multiple
          options={wrapOptions}
          value={wrapSelectedItems}
          onChange={onAutocompleteChange}
          isOptionEqualToValue={(a, b) => a.value === b.value}
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={(params) => <TextField {...params} placeholder={hintText} />}
          renderTags={(tagValue, getTagProps) => (
            tagValue.map((option, index) => (
              <Chip
                label={option.label || '(None)'}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...getTagProps({ index })}
              />
            ))
          )}
        />
      </Grid>
    </Grid>
  );
};

export default MultiSelectAutoComplete;
