import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import { hasSidebar } from 'store/ui/actions';
import { Header } from 'components/Header';

class MainLayout extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.hasSidebar(true);
    }

    render() {
        return (
            <div className="wrapper">
                <Header
                    filters={this.props.filters}
                    searchLabel={this.props.searchLabel}
                    onSearchChange={this.props.onSearchChange}
                    onDateChange={this.props.onDateChange}
                    onFilterChange={this.props.onFilterChange}
                />
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
    hasSidebar,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainLayout);
