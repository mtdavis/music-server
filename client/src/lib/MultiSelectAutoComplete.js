import React from 'react';
import {AutoComplete, Chip} from 'material-ui';

function filter(searchText, key) {
    return searchText === '' ||
        key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
}

class MultiSelectAutoComplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            selectedItems: []
        };
    }

    render() {
        var chips = this.state.selectedItems.map(this.renderChip.bind(this));

        return (
            <div style={{layout: 'flex'}}>
                <AutoComplete
                    filter={filter}
                    popoverProps={{
                        zDepth: 2,
                        useLayerForClickAway: true,
                        style: {
                            overflowY: 'scroll'
                        }
                    }}
                    hintText={this.props.hintText}
                    menuCloseDelay={0}
                    openOnFocus={true}
                    dataSource={this.props.dataSource}
                    searchText={this.state.searchText}
                    onUpdateInput={this.handleUpdateInput.bind(this)}
                    onNewRequest={this.selectItem.bind(this)} />

                {chips}
            </div>
        )
    }

    handleUpdateInput(searchText) {
        this.setState({searchText});
    }

    renderChip(item) {
        var style = {
            verticalAlign: 'middle',
            display: 'inline-block',
            marginLeft: 8,
            marginTop: 4,
            marginBottom: 4,
        };
        var labelStyle = {
            verticalAlign: 'top'
        }
        return (
            <Chip
                key={item}
                style={style}
                labelStyle={labelStyle}
                onRequestDelete={() => this.deselectItem(item)}>
                {item || '(None)'}
            </Chip>
        )
    }

    deselectItem(item) {
        var index = this.state.selectedItems.indexOf(item);
        if(index !== -1) {
            var selectedItems = this.state.selectedItems.slice();
            selectedItems.splice(index, 1);
            this.setState({selectedItems});

            if(this.props.onSelectedItemsUpdate) {
                this.props.onSelectedItemsUpdate(selectedItems);
            }
        }

    }

    selectItem(item) {
        if(this.props.dataSource.includes(item) &&
            !this.state.selectedItems.includes(item)) {

            var selectedItems = this.state.selectedItems.slice();
            selectedItems.push(item);
            this.setState({
                selectedItems,
                searchText: ''
            });

            if(this.props.onSelectedItemsUpdate) {
                this.props.onSelectedItemsUpdate(selectedItems);
            }
        }
    }
}

export default MultiSelectAutoComplete;
