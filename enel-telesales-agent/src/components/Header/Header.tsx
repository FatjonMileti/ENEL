import React from 'react';
import autoBind from 'react-autobind';

import SearchBar from './components/SearchBar';
import DateFilter from './components/DateFilter';
import MainFilters from './components/MainFilters';

import './Header.scss';

interface Props {
    onSearchChange: (search: string) => void;
    onFilterChange: (filter: string) => void;
    onDateChange: (date: string) => void;
    filters: object;
    searchLabel: string;
}

export class Header extends React.Component<Props> {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    render() {
        return (
            <div className="Header">
                <div className="header-logo">
                    <img src="/img/PPC_logo_negative.svg" alt="" />
                </div>

                <SearchBar label={this.props.searchLabel} onChange={this.props.onSearchChange} />
                <MainFilters filters={this.props.filters} onChange={this.props.onFilterChange} />
                <DateFilter onChange={this.props.onDateChange} />

                <div className="profile-image">MC</div>
            </div>
        );
    }
}
