import {
  action,
  autorun,
  computed,
  IObservableArray,
  ObservableSet,
  ObservableMap,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import {getUniqueValues, rowPassesFilter} from './util';

export class FilterStore<R extends RowData> {

  baseRows: IObservableArray<R> = observable.array([]);
  columns: IObservableArray<ColumnConfig<R>> = observable.array([]);
  filterKeys: IObservableArray<keyof R> = observable.array([]);

  availableOptions: ObservableMap<keyof R, RowDataValue[]> = observable.map({});
  selectedItems: ObservableMap<keyof R, RowDataValue[]> = observable.map({});
  filterText = '';
  filterTextValid = true;
  hiddenRowIds: ObservableSet<number> = observable.set([]);

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
      hiddenRowIds: observable,
      setBaseRows: action,
      setFilterText: action,
      setSelectedItems: action,
      clearFilters: action,
      hasFilters: computed,
    });

    autorun(this.runFilter, {
      delay: 200
    });
  }

  setBaseRows(baseRows: R[]): void {
    this.baseRows.replace(baseRows);
  }

  setFilterText(filterText: string): void {
    this.filterText = filterText;
  }

  getSelectedItems(filterKey: keyof R): RowDataValue[] {
    return this.selectedItems.get(filterKey) as RowDataValue[];
  }

  setSelectedItems(filterKey: keyof R, newSelectedItems: RowDataValue[]): void {
    this.selectedItems.set(filterKey, newSelectedItems);
  }

  get hasFilters(): boolean {
    if(this.filterText) {
      return true;
    }

    for(const filterKey of this.filterKeys) {
      const selectedItems = this.selectedItems.get(filterKey);
      if(selectedItems && selectedItems.length > 0) {
        return true;
      }
    }

    return false;
  }

  clearFilters = (): void => {
    this.filterText = '';
    this.filterTextValid = true;

    for(const filterKey of this.filterKeys) {
      this.selectedItems.set(filterKey, []);
    }
  };

  runFilter = (): void => {
    const newAvailableOptions = new Map();
    let filteredRows = this.baseRows.slice();

    this.filterKeys.forEach(filterKey => {
      const selectedItemsForKey = this.selectedItems.get(filterKey) || [];

      const options = getUniqueValues(filteredRows, filterKey);
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

    const hiddenRowIds = new Set<number>();
    this.baseRows.forEach(row => {
      hiddenRowIds.add(row.id);
    });

    filteredRows.forEach(row => {
      hiddenRowIds.delete(row.id);
    });

    runInAction(() => {
      this.availableOptions.replace(newAvailableOptions);
      this.filterTextValid = newFilterTextValid;

      if(newFilterTextValid) {
        this.hiddenRowIds.replace(hiddenRowIds);
      }
    });
  };
}

export class FilterStoreMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterStores: ObservableMap<string, FilterStore<any>> = observable.map({});

  constructor() {
    makeObservable(this, {
      filterStores: observable,
      get: action,
    });
  }

  get<R extends RowData>(
    tag: string,
    baseRows: R[],
    columns: ColumnConfig<R>[],
    filterKeys: (keyof R)[]
  ): FilterStore<R> {
    if(this.filterStores.has(tag)) {
      return this.filterStores.get(tag) as FilterStore<R>;
    }

    const newFilterStore = new FilterStore<R>(baseRows, columns, filterKeys);
    this.filterStores.set(tag, newFilterStore);
    return newFilterStore;
  }
}
