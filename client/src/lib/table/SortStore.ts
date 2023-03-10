import equal from 'fast-deep-equal';
import { compare } from 'lib/util';
import {
  action,
  autorun,
  computed,
  IObservableArray,
  ObservableMap,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import SortOrder from './SortOrder';

function getRowComparator<R extends RowData>(
  sortSpec: SortSpec<R>,
): (rowA: R, rowB: R) => number {
  const {
    columnKey,
    order = SortOrder.Ascending,
  } = sortSpec;

  return (rowA: R, rowB: R) => {
    const valA = rowA[columnKey];
    const valB = rowB[columnKey];
    return compare(valA, valB) * order;
  };
}

export class SortStore<R extends RowData> {
  baseRows: IObservableArray<R> = observable.array([]);

  columns: IObservableArray<ColumnConfig<R>> = observable.array([]);

  sortSpecs: IObservableArray<SortSpec<R>> = observable.array([]);

  sortedRows: IObservableArray<R> = observable.array([]);

  constructor(baseRows: R[], columns: ColumnConfig<R>[], initialSortSpecs: SortSpec<R>[]) {
    this.baseRows.replace(baseRows);
    this.columns.replace(columns);
    this.sortSpecs.replace(initialSortSpecs);

    makeObservable(this, {
      baseRows: observable,
      columns: observable,
      sortSpecs: observable,
      setBaseRows: action,
      setSortColumnKey: action,
      topSortSpec: computed,
    });

    autorun(this.sortRows);
  }

  setBaseRows(baseRows: R[]): void {
    if (!equal(this.baseRows, baseRows)) {
      this.baseRows.replace(baseRows);
    }
  }

  setSortColumnKey(newSortColumnKey: keyof R): void {
    const newSortSpecs = this.sortSpecs.slice();

    // check if newSortColumnKey is already in sortSpecs
    const existingIndex = newSortSpecs.findIndex(
      (spec) => spec.columnKey === newSortColumnKey,
    );

    if (existingIndex === -1) {
      // does not exist, so add it to the top position.
      newSortSpecs.push({ columnKey: newSortColumnKey });
    } else if (existingIndex === newSortSpecs.length - 1) {
      // exists in top position, so flip its order.
      const sortSpec = { ...newSortSpecs[existingIndex] };
      newSortSpecs.splice(existingIndex, 1);

      const order = sortSpec.order || SortOrder.Ascending;
      sortSpec.order = (-order) as SortOrder;
      newSortSpecs.push(sortSpec);
    } else {
      // exists in some other position,
      // so remove it and re-add to the top position.
      newSortSpecs.splice(existingIndex, 1);

      newSortSpecs.push({ columnKey: newSortColumnKey });
    }

    this.sortSpecs.replace(newSortSpecs);
  }

  sortRows = (): void => {
    let sortedRows = this.baseRows.slice();

    this.sortSpecs.forEach((sortSpec) => {
      const comparator = getRowComparator(sortSpec);
      sortedRows = sortedRows.sort(comparator);
    });

    runInAction(() => {
      this.sortedRows.replace(sortedRows);
    });
  };

  get topSortSpec(): SortSpec<R> | null {
    if (this.sortSpecs.length === 0) {
      return null;
    }

    return this.sortSpecs[this.sortSpecs.length - 1];
  }
}

export class SortStoreMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortStores: ObservableMap<string, SortStore<any>> = observable.map({});

  constructor() {
    makeObservable(this, {
      sortStores: observable,
      get: action,
    });
  }

  get<R extends RowData>(
    tag: string,
    baseRows: R[],
    columns: ColumnConfig<R>[],
    initialSortSpecs: SortSpec<R>[],
  ): SortStore<R> {
    if (this.sortStores.has(tag)) {
      return this.sortStores.get(tag) as SortStore<R>;
    }

    const newSortStore = new SortStore<R>(baseRows, columns, initialSortSpecs);
    this.sortStores.set(tag, newSortStore);
    return newSortStore;
  }
}
