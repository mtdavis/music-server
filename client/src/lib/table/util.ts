import jsep, {
  BinaryExpression,
  Expression,
  Identifier,
  Literal,
  UnaryExpression,
} from 'jsep';
import { renderAlbumStar } from 'lib/AlbumStar';
import {
  compare,
  secondsToTimeString,
  unixTimestampToDateString,
  unixTimestampToYear,
} from 'lib/util';
import splitargs from 'splitargs';

jsep.addBinaryOp(':', 10);
jsep.addBinaryOp('~=', 6);

function rowContainsText<R extends RowData>(
  rowData: R,
  text: string,
  columns: ColumnConfig<R>[],
): boolean {
  const textChunks = splitargs(text.toLowerCase());
  const foundChunks = new Set();

  columns.forEach((column) => {
    const cellValue = rowData[column.key];
    if (cellValue === null) {
      return;
    }

    let rendered: string;
    if (column.type === 'year' && typeof cellValue === 'number') {
      rendered = String(unixTimestampToYear(cellValue));
    } else if (column.type === undefined || column.type === 'plain') {
      rendered = String(cellValue).toLowerCase();
    } else {
      return;
    }

    textChunks.forEach((chunk) => {
      if (rendered.includes(chunk)) {
        foundChunks.add(chunk);
      }
    });
  });

  return textChunks.length === foundChunks.size;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const binops: { [key: string]: (a: any, b: any) => any } = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  ':': (a, b) => (a * 60) + b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a == b, // eslint-disable-line eqeqeq
  '>=': (a, b) => a >= b,
  '>': (a, b) => a > b,
  '!=': (a, b) => a != b, // eslint-disable-line eqeqeq
  '~=': (a, b) => a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) > -1,
  '&&': (a, b) => a && b,
  '||': (a, b) => a || b,
};

const unops: { [key: string]: (a: any) => any } = {
  '-': (a) => -a,
  '+': (a) => +a,
  '!': (a) => !a,
};

function evaluateFilterExpression<R extends RowData>(
  rowData: R,
  astNode: Expression,
  columns: ColumnConfig<R>[],
): any {
  if (astNode.type === 'BinaryExpression'
  ) {
    return binops[(astNode as BinaryExpression).operator](
      evaluateFilterExpression(rowData, (astNode as BinaryExpression).left, columns),
      evaluateFilterExpression(rowData, (astNode as BinaryExpression).right, columns),
    );
  }
  if (astNode.type === 'UnaryExpression') {
    return unops[(astNode as UnaryExpression).operator](
      evaluateFilterExpression(rowData, (astNode as UnaryExpression).argument, columns),
    );
  }
  if (astNode.type === 'Literal') {
    return (astNode as Literal).value;
  }
  if (astNode.type === 'Identifier') {
    const { name } = astNode as Identifier;
    if (name === 'last_play') {
      const date = new Date((rowData[name] as number) * 1000);
      return date.toISOString().substring(0, 10);
    }

    return rowData[name] as any;
  }

  return undefined;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function rowPassesFilter<R extends RowData>(
  rowData: R,
  filterText: string,
  columns: ColumnConfig<R>[],
): boolean {
  let result;

  if (filterText === '') {
    result = true;
  } else if (filterText[filterText.length - 1] === '?') {
    const astNode = jsep(filterText.substring(0, filterText.length - 1));
    result = evaluateFilterExpression(rowData, astNode, columns);
  } else {
    result = rowContainsText(rowData, filterText, columns);
  }

  return result;
}

export function getUniqueValues<R extends RowData>(
  objects: R[],
  key: keyof R,
): RowDataValue[] {
  const valueSet = new Set(objects.map((object) => object[key]));
  const result = Array.from(valueSet);
  result.sort(compare);
  return result;
}

export function renderValue<V extends RowDataValue, R extends RowData>(
  value: V,
  rowData: R,
  column: ColumnConfig<R>,
  icons?: { [key: string]: React.ReactNode },
): number | string | React.ReactNode {
  if (value === null) {
    return '';
  }

  if (column.type === 'icon' && icons && typeof value === 'string' && icons[value]) {
    return icons[value];
  }

  if (column.type === 'star' && typeof value === 'boolean') {
    return renderAlbumStar(value, rowData.id);
  }

  if (column.type === 'year' && typeof value === 'number') {
    return unixTimestampToYear(value);
  }

  if (column.type === 'date' && typeof value === 'number') {
    return unixTimestampToDateString(value);
  }

  if (column.type === 'duration' && typeof value === 'number') {
    return secondsToTimeString(value);
  }

  return String(value);
}

export function getRowArrayIds(array: RowData[]): number[] {
  return array.map((item) => item.id);
}

type ColumnWidthMap<R extends RowData> = { [Property in keyof R]: number };

export function calculateColumnWidths<R extends RowData>(
  rows: R[],
  columns: ColumnConfig<R>[],
): ColumnWidthMap<R> {
  const lengths: { [Property in keyof R]: number } = {} as { [Property in keyof R]: number };

  columns.forEach((column) => {
    lengths[column.key] = 2; // arbitrary good starting point

    rows.forEach((row) => {
      const renderedValue = renderValue(row[column.key], row, column);
      const length = Math.sqrt(String(renderedValue).length);

      if (lengths[column.key] < length) {
        lengths[column.key] = length;
      }
    });
  });

  const sum: number = Object.values(lengths).reduce((acc, val) => acc + val);

  const result: ColumnWidthMap<R> = {} as ColumnWidthMap<R>;

  columns.forEach((column) => {
    result[column.key] = (lengths[column.key] / sum) * 100;
  });

  return result;
}
