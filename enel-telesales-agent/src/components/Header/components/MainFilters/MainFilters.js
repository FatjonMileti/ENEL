import React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import _ from 'lodash';

import { hasFilters } from 'store/ui/selectors';
import { setFilters } from 'store/ui/actions';

import { Button } from 'components/Button';

import './MainFilters.scss';

class MainFilters extends React.Component {
    state = { show: false, filters: {} };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    toggleShow() {
        this.setState({ show: !this.state.show });
    }

    handleApplyFiltersClick() {
        this.toggleShow();
    }

    handleCancelClick() {
        this.toggleShow();
    }

    handleFilterChange(e, filter) {
        const filters = {
            ...this.state.filters,
            [e.target.name]: e.target.value,
        };

        if (e.target.name === 'leadStatus') {
            filters['leadSubstatus'] = undefined;
        }

        this.setState({ filters });

        if (filter && filter.onChange) {
            filter.onChange(e);
        }
    }

    handleApplyClick() {
        this.props.setFilters(this.state.filters);
        this.toggleShow();
        if (this.props.onChange) this.props.onChange();
    }

    handleClearClick() {
        this.setState({ filters: {} }, () => {
            this.handleApplyClick();
        });
    }

    renderFilters(side) {
        const filters = _.filter(this.props.filters, (filter, index) =>
            side === 'left' ? index % 2 === 0 : index % 2 === 1
        );

        return _.map(filters, filter => (
            <div key={filter.name} className="form-group select">
                <select
                    name={filter.name}
                    className="form-control"
                    onChange={e => this.handleFilterChange(e, filter)}
                    value={this.state.filters[filter.name] || ''}
                >
                    <option value="">Any</option>
                    {_.map(filter.options, option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <label className="control-label">{filter.label}</label>
            </div>
        ));
    }

    render() {
        const { hasFilters } = this.props;
        if (hasFilters) {
            return (
                <div className="MainFilters">
                    <p
                        key={2}
                        className={` apply-filter hc-btn trigger-filters${
                            this.state.show ? ' selected' : ''
                        }`}
                        onClick={this.handleApplyFiltersClick}
                    >
                        <i className="icon-wlc-filters" />
                        Apply filters
                    </p>
                    <div
                        className={`mainfilters transition-3s-in-out${
                            this.state.show ? ' opened' : ''
                        }`}
                    >
                        <form className="clearfix">
                            <div className="w50s left">{this.renderFilters('left')}</div>
                            <div className="w50s right">{this.renderFilters('right')}</div>
                        </form>
                        <div className="btn-panel">
                            <Button
                                secondary
                                className="ui-priority-primary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"
                                value="Apply"
                                onClick={this.handleApplyClick}
                            />
                            <Button
                                secondary
                                className="ui-priority-secondary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"
                                value="Clear"
                                onClick={this.handleClearClick}
                            />
                            <Button
                                secondary
                                className="ui-priority-secondary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"
                                value="Cancel"
                                onClick={this.handleCancelClick}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    }
}

const mapStateToProps = state => ({
    hasFilters: hasFilters(state),
});

const mapDispatchToProps = {
    setFilters,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainFilters);
