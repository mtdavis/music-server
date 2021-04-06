import React from 'react';
import {
  Chip,
  Grid,
  TextField,
} from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';

type Item = string | number | null;

interface Props {
  hintText: string;
  options: (Item)[];
  onSelectedItemsUpdate: (items: (Item)[]) => void;
}

const MultiSelectAutoComplete = ({
  hintText,
  options,
  onSelectedItemsUpdate,
}: Props): React.ReactElement => {
  const [selectedItems, setSelectedItems] = React.useState<Item[]>([]);
  const [autocompleteValue, setAutocompleteValue] = React.useState(null);
  const [autocompleteInputValue, setAutocompleteInputValue] = React.useState('');

  const deselectItem = (item: Item): void => {
    if(item === '(None)') {
      item = null;
    }

    const index = selectedItems.indexOf(item);
    if(index !== -1) {
      const newSelectedItems = selectedItems.slice();
      newSelectedItems.splice(index, 1);
      setSelectedItems(newSelectedItems);

      if(onSelectedItemsUpdate) {
        onSelectedItemsUpdate(newSelectedItems);
      }
    }
  };

  const renderChip = (item: Item): React.ReactElement => (
    <Grid item key={item || '(None)'}>
      <Chip
        label={item || '(None)'}
        onDelete={() => deselectItem(item)}
      />
    </Grid>
  );

  const onAutocompleteChange = (event: React.ChangeEvent<unknown>, item: Item): void => {
    if(item === '(None)') {
      item = null;
    }

    if(options.includes(item) && !selectedItems.includes(item)) {
      const newSelectedItems = selectedItems.slice();
      newSelectedItems.push(item);

      setSelectedItems(newSelectedItems);
      setAutocompleteValue(null);
      setAutocompleteInputValue('');

      if(onSelectedItemsUpdate) {
        onSelectedItemsUpdate(newSelectedItems);
      }
    }
  };

  const onAutocompleteInputChange = (event: React.ChangeEvent<unknown>, value: string): void => {
    setAutocompleteInputValue(value);
  };

  const chips = selectedItems.map(renderChip);

  if(options.indexOf(null) !== -1) {
    options = options.slice();
    options.splice(options.indexOf(null), 1); // remove null
    options.splice(0, 0, '(None)');
  }

  return (
    <Grid container direction='column' spacing={1}>
      <Grid item>
        <Autocomplete
          options={options}
          value={autocompleteValue}
          inputValue={autocompleteInputValue}
          onChange={onAutocompleteChange}
          onInputChange={onAutocompleteInputChange}
          renderInput={(params) => <TextField {...params} placeholder={hintText} />}
        />
      </Grid>

      <Grid item>
        <Grid container direction='row' spacing={1}>
          {chips}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MultiSelectAutoComplete;
