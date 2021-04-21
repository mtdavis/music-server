import React from 'react';
import {
  Chip,
  Collapse,
  Grid,
  TextField,
} from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';

type Item = string | number | null;

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
      onSelectedItemsUpdate(newSelectedItems);
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

      onSelectedItemsUpdate(newSelectedItems);
      setAutocompleteValue(null);
      setAutocompleteInputValue('');
    }
  };

  const onAutocompleteInputChange = (event: React.ChangeEvent<unknown>, value: string): void => {
    setAutocompleteInputValue(value);
  };

  const chips = selectedItems.map(renderChip);

  const renderedOptions = options.slice();
  if(renderedOptions.indexOf(null) !== -1) {
    renderedOptions.splice(renderedOptions.indexOf(null), 1); // remove null
    renderedOptions.splice(0, 0, '(None)');
  }

  return (
    <Grid container direction='column' spacing={1}>
      <Grid item>
        <Autocomplete
          options={renderedOptions}
          value={autocompleteValue}
          inputValue={autocompleteInputValue}
          onChange={onAutocompleteChange}
          onInputChange={onAutocompleteInputChange}
          renderInput={(params) => <TextField {...params} placeholder={hintText} />}
        />
      </Grid>

      <Collapse in={chips.length > 0}>
        <Grid item>
          <Grid container direction='row' spacing={1}>
            {chips}
          </Grid>
        </Grid>
      </Collapse>
    </Grid>
  );
};

export default MultiSelectAutoComplete;
