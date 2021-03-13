import React from 'react';
import jsep, {
  BinaryExpression,
  Expression,
  Identifier,
  Literal,
  LogicalExpression,
  UnaryExpression,
} from 'jsep';

import {compare} from '../util';

jsep.addBinaryOp(":", 10);
jsep.addBinaryOp("~=", 6);

function rowContainsText(
  rowData: RowData,
  text: string,
  columns: ColumnConfig[]
): boolean {
  text = text.toLowerCase();

  for(let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const cellValue = rowData[column.key];

    if(column.renderer) {
      if(String(column.renderer(cellValue)).toLowerCase().indexOf(text) > -1) {
        return true;
      }
    }
    else if(cellValue !== null && cellValue.toString().toLowerCase().indexOf(text) > -1) {
      return true;
    }
  }

  return false;
}

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

function evaluateFilterExpression(
  rowData: RowData,
  astNode: Expression,
  columns: ColumnConfig[]
): any {
  if(astNode.type === "BinaryExpression" ||
    astNode.type === "LogicalExpression"
  ) {
    return binops[(astNode as BinaryExpression).operator](
      evaluateFilterExpression(rowData, (astNode as BinaryExpression).left, columns),
      evaluateFilterExpression(rowData, (astNode as BinaryExpression).right, columns));
  }
  else if(astNode.type === "UnaryExpression") {
    return unops[(astNode as UnaryExpression).operator](
      evaluateFilterExpression(rowData, (astNode as UnaryExpression).argument, columns));
  }
  else if(astNode.type === "Literal") {
    return (astNode as Literal).value;
  }
  else if(astNode.type === "Identifier") {
    const name = (astNode as Identifier).name
    if(name === 'last_play') {
      const date = new Date((rowData[name] as number) * 1000);
      return date.toISOString().substring(0, 10);
    }

    return rowData[name] as any;
  }
}

export function rowPassesFilter(
  rowData: RowData,
  filterText: string,
  columns: ColumnConfig[]
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
): any[] {
  const result: any[] = [];
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

export function sortBySpecs<R extends RowData>(
  rows: R[],
  sortSpecs: SortSpec[]
): R[] {
  let sortedRows = rows.slice();

  for(const sortSpec of sortSpecs) {
    const {columnKey, order} = sortSpec;
    const comparator = getRowComparator(columnKey, order);
    sortedRows = sortedRows.sort(comparator);
  }

  return sortedRows;
}

export function renderIcon(
  value: React.ReactNode
): React.ReactNode {
  return value;
}
