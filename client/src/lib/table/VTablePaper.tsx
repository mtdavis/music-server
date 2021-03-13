import React from 'react';
import Paper from '@material-ui/core/Paper';
import {
  AutoSizer,
  AutoSizerProps,
} from 'react-virtualized';

interface Props {
  rowCount: number;
  showHeader: boolean;
  rowHeight: number;
  headerHeight: number;
  children: AutoSizerProps['children'];
}

class VTablePaper extends React.Component<Props> {
  render() {
    const {rowCount, showHeader, rowHeight, headerHeight} = this.props;

    const heightBasedOnRows = (rowCount * rowHeight) + (showHeader ? headerHeight : 0);

    return (
      <Paper style={{
        height: `min(${heightBasedOnRows}px, 100%)`,
        width: '100%',
      }}>
        <AutoSizer>
          {this.props.children}
        </AutoSizer>
      </Paper>
    );
  }
}

export default VTablePaper;
