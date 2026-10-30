import React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';

import { hasSearch } from 'store/ui/selectors';
import { setSearch } from 'store/ui/actions';

import './SearchBar.scss';

class SearchBar extends React.Component {
    state = { value: null };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    handleSearchChange(e) {
        this.setState({
            value: e.target.value,
        });
    }

    handleApply(e) {
        e.preventDefault();
        this.props.setSearch(this.state.value);
        if (this.props.onChange) this.props.onChange();
    }

    render() {
        const { hasSearch, label } = this.props;

        if (hasSearch) {
            return (
                <div className="SearchBar">
                    <form className="search">
                        <fieldset>
                            <input
                                type="text"
                                placeholder={label}
                                value={this.state.value}
                                onChange={this.handleSearchChange}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') this.handleApply(e);
                                }}
                            />
                            <button onClick={this.handleApply}>
                                <i className="icon-wlc-search"></i>
                            </button>
                        </fieldset>
                    </form>
                </div>
            );
        }

        return null;
    }
}

const mapStateToProps = state => ({
    hasSearch: hasSearch(state),
});

const mapDispatchToProps = {
    setSearch,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchBar);
