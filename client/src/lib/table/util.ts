import jsep, {
  BinaryExpression,
  Expression,
  Identifier,
  Literal,
  LogicalExpression,
  UnaryExpression,
} from 'jsep';
import memoizeOne from 'memoize-one';
import equal from 'fast-deep-equal';
import splitargs from 'splitargs';

import {renderValue} from './VTableCell';
import {compare} from 'lib/util';

jsep.addBinaryOp(":", 10);
jsep.addBinaryOp("~=", 6);

function rowContainsText<R extends RowData>(
  rowData: R,
  text: string,
  columns: ColumnConfig<R>[]
): boolean {
  const textChunks = splitargs(text.toLowerCase());
  const foundChunks = new Set();

  columns.forEach(column => {
    const cellValue = rowData[column.key];
    const rendered = column.renderer ? column.renderer(cellValue) : cellValue;
    const renderedString = String(rendered === null ? '' : rendered).toLowerCase();

    textChunks.forEach(chunk => {
      if(renderedString.includes(chunk)) {
        foundChunks.add(chunk);
      }
    });
  });

  return textChunks.length === foundChunks.size;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const binops: {[key: string]: (a: any, b: any) => any} = {
  "+" : (a, b) => a + b,
  "-" : (a, b) => a - b,
  "*" : (a, b) => a * b,
  "/" : (a, b) => a / b,
  ":" : (a, b) => (a * 60) + b,
  "<" : (a, b) => a < b,
  "<=" : (a, b) => a <= b,
  "==" : (a, b) => a == b, // eslint-disable-line eqeqeq
  ">=" : (a, b) => a >= b,
  ">" : (a, b) => a > b,
  "!=" : (a, b) => a != b, // eslint-disable-line eqeqeq
  "~=" : (a, b) => a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) > -1,
  "&&" : (a, b) => a && b,
  "||" : (a, b) => a || b,
};

const unops: {[key: string]: (a: any) => any} = {
  "-" : (a) => -a,
  "+" : (a) => +a,
  "!" : (a) => !a,
};

function evaluateFilterExpression<R extends RowData>(
  rowData: R,
  astNode: Expression,
  columns: ColumnConfig<R>[]
): any {
  if(astNode.type === "BinaryExpression" ||
    astNode.type === "LogicalExpression"
  ) {
    return binops[(astNode as BinaryExpression | LogicalExpression).operator](
      evaluateFilterExpression(rowData, (astNode as BinaryExpression | LogicalExpression).left, columns),
      evaluateFilterExpression(rowData, (astNode as BinaryExpression | LogicalExpression).right, columns));
  }
  else if(astNode.type === "UnaryExpression") {
    return unops[(astNode as UnaryExpression).operator](
      evaluateFilterExpression(rowData, (astNode as UnaryExpression).argument, columns));
  }
  else if(astNode.type === "Literal") {
    return (astNode as Literal).value;
  }
  else if(astNode.type === "Identifier") {
    const name = (astNode as Identifier).name;
    if(name === 'last_play') {
      const date = new Date((rowData[name] as number) * 1000);
      return date.toISOString().substring(0, 10);
    }

    return rowData[name] as any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function rowPassesFilter<R extends RowData>(
  rowData: R,
  filterText: string,
  columns: ColumnConfig<R>[]
): boolean {
  let result;

  if(filterText === "") {
    result = true;
  }
  else if(filterText[filterText.length-1] === "?") {
    const astNode = jsep(filterText.substring(0, filterText.length-1));
    result = evaluateFilterExpression(rowData, astNode, columns);
  }
  else {
    result = rowContainsText(rowData, filterText, columns);
  }

  return result;
}

export function getUniqueValues<R extends RowData>(
  objects: R[],
  key: keyof R,
): RowDataValue[] {
  const result: RowDataValue[] = [];
  for(const object of objects) {
    const value = object[key];
    if(!result.includes(value)) {
      result.push(value);
    }
  }
  result.sort(compare);
  return result;
}

function getRowComparator<R extends RowData>(
  columnKey: keyof R,
  order: 1 | -1
): (rowA: R, rowB: R) => number {
  return function(rowA: R, rowB: R) {
    const valA = rowA[columnKey];
    const valB = rowB[columnKey];
    return compare(valA, valB) * order;
  };
}

function _sortBySpecs<R extends RowData>(
  rows: R[],
  sortSpecs: SortSpec<R>[]
): R[] {
  let sortedRows = rows.slice();

  for(const sortSpec of sortSpecs) {
    const {columnKey, order} = sortSpec;
    const comparator = getRowComparator(columnKey, order);
    sortedRows = sortedRows.sort(comparator);
  }

  return sortedRows;
}

export const sortBySpecs = memoizeOne(_sortBySpecs, equal);

export function renderIcon(
  value: string
): string {
  return value;
}

export function getRowArrayIds(array: RowData[]): number[] {
  return array.map(item => item.id);
}

type ColumnWidthMap<R extends RowData> = {[Property in keyof R]: number}

function _calculateColumnWidths<R extends RowData>(
  rows: R[],
  columns: ColumnConfig<R>[],
): ColumnWidthMap<R> {
  const result: ColumnWidthMap<R> = {} as ColumnWidthMap<R>;

  columns.forEach(column => {
    result[column.key] = 4; // arbitrary good starting point

    rows.forEach(row => {
      const renderedValue = renderValue(row[column.key], column);
      const length = String(renderedValue).length;

      if(result[column.key] < length) {
        result[column.key] = length;
      }
    });
  });

  return result;
}

export const calculateColumnWidths = memoizeOne(_calculateColumnWidths, equal);
