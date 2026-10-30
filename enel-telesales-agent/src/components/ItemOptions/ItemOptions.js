import React, { Component } from 'react';
import autoBind from 'react-autobind';

import './ItemOptions.scss';

class ItemOptions extends Component {
    state = {
        show: false,
        key: Math.random().toString(),
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        window.addEventListener('click', this.handleClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClick);
    }

    handleClick(e) {
        if (!e.key || e.key !== this.state.key) {
            this.setState({ show: false });
        }
    }

    handleToggleClick(e) {
        e.nativeEvent.key = this.state.key;
        this.setState({ show: !this.state.show });
    }

    render() {
        const { show } = this.state;
        return (
            <div
                className={`ItemOptions ${
                    show ? 'view-more-options-list' : 'hide-more-options-list'
                }`}
            >
                <i
                    onClick={this.handleToggleClick}
                    className="ion-md-more square-btn-light trigger-edit-row"
                />
                <div className="more-options-list dynamic-list">{this.props.children}</div>
            </div>
        );
    }
}

export default ItemOptions;
