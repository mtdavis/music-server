import {
  action,
  autorun,
  IObservableArray,
  ObservableMap,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import {getUniqueValues, rowPassesFilter} from './util';

export default class FilterStore<R extends RowData> {

  baseRows: IObservableArray<R> = observable.array([]);
  columns: IObservableArray<ColumnConfig<R>> = observable.array([]);
  filterKeys: IObservableArray<keyof R> = observable.array([]);

  availableOptions: ObservableMap<keyof R, RowDataValue[]> = observable.map({});
  selectedItems: ObservableMap<keyof R, RowDataValue[]> = observable.map({});
  filterText = '';
  filterTextValid = true;
  filteredRows: IObservableArray<R> = observable.array([]);

  constructor(baseRows: R[], columns: ColumnConfig<R>[], filterKeys: (keyof R)[]) {
    this.baseRows.replace(baseRows);
    this.columns.replace(columns);
    this.filterKeys.replace(filterKeys);

    for(const filterKey of filterKeys) {
      this.selectedItems.set(filterKey, []);

      // will be populated in the autorun
      this.availableOptions.set(filterKey, []);
    }

    makeObservable(this, {
      baseRows: observable,
      columns: observable,
      filterKeys: observable,
      availableOptions: observable,
      selectedItems: observable,
      filterText: observable,
      filterTextValid: observable,
      filteredRows: observable,
      setBaseRows: action,
      setSelectedItems: action,
      setFilterText: action,
    });

    autorun(this.runFilter);
  }

  setBaseRows(baseRows: R[]): void {
    this.baseRows.replace(baseRows);
  }

  setSelectedItems(filterKey: keyof R, newSelectedItems: RowDataValue[]): void {
    this.selectedItems.set(filterKey, newSelectedItems);
  }

  setFilterText(filterText: string): void {
    this.filterText = filterText;
  }

  runFilter: () => void = () => {
    const newAvailableOptions = new Map();
    let filteredRows = this.baseRows.slice();

    this.filterKeys.forEach(filterKey => {
      const selectedItemsForKey = this.selectedItems.get(filterKey) || [];

      const options = getUniqueValues(filteredRows, filterKey).filter(
        val => !selectedItemsForKey.includes(val));
      newAvailableOptions.set(filterKey, options);

      if(selectedItemsForKey.length > 0) {
        filteredRows = filteredRows.filter(rowData =>
          selectedItemsForKey.includes(rowData[filterKey])
        );
      }
    });

    let newFilterTextValid = true;
    try {
      filteredRows = filteredRows.filter(rowData =>
        rowPassesFilter(rowData, this.filterText, this.columns)
      );
    }
    catch(ex) {
      newFilterTextValid = false;
    }

    runInAction(() => {
      this.availableOptions.replace(newAvailableOptions);
      this.filterTextValid = newFilterTextValid;

      if(newFilterTextValid) {
        this.filteredRows.replace(filteredRows);
      }
    });
  }
}
