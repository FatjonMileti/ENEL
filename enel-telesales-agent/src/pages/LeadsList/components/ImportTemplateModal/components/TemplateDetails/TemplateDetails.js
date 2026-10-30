import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import _ from 'lodash';

import { Text, Select } from 'components/form';
import { LEAD_PARAMS } from 'services/lead';

class TemplateDetails extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        const { prevTemplate } = prevProps;
        const { template } = this.props;
        if (!_.isEqual(prevTemplate, template)) {
            this.loadTemplate();
        }
    }

    loadTemplate() {
        const { template, formApi } = this.props;
        if (formApi) {
            _.map(template, (value, key) => {
                formApi.setValues({
                    [`${key}_option`]: key,
                    [`${key}_value`]: value,
                });
            });
        }
    }

    getAllTemplateOptions() {
        return _.map(LEAD_PARAMS, (value, key) => ({ value: key, label: value.label }));
    }

    getRemainingTemplateOptions() {
        const { template } = this.props;
        const options = _.difference(Object.keys(LEAD_PARAMS), Object.keys(template));
        return _.map(options, value => ({
            value,
            label: LEAD_PARAMS[value].label,
        }));
    }

    handleOptionChange(e, index) {
        this.props.formApi.setValues({
            [`leadField_${index}`]: e.target.value,
        });
    }

    handleAddClick() {
        const { formApi } = this.props;
        if (formApi && this.props.onAdd) {
            const key = formApi.getValue('leadField_add');
            const value = formApi.getValue('columnNumber_add');
            if (key && value) {
                this.props.onAdd(key, value);
                formApi.setValues({
                    leadField_add: '',
                    columnNumber_add: '',
                });
            }
        }
    }

    handleRemoveClick(key) {
        if (this.props.onRemove) {
            this.props.onRemove(key);
        }
    }

    renderRemoveButton(key) {
        return (
            <i
                className="clickable ion-ios-remove-circle-outline col-md-1"
                onClick={e => this.handleRemoveClick(key)}
            />
        );
    }

    renderTemplate() {
        const { template, formApi } = this.props;
        if (formApi) {
            return _.map(template, (value, key, template, index) => (
                <div key={`${key}-${index}`} className="row">
                    <Select
                        className="col-md-6"
                        label="Date Lead"
                        name={`${key}_option`}
                        options={this.getAllTemplateOptions()}
                        disabled
                        black
                    />
                    <Text
                        className="col-md-5 text-input"
                        label="Numar Coloana"
                        name={`${key}_value`}
                        type="number"
                        display
                    />
                    {this.renderRemoveButton(key)}
                </div>
            ));
        }
    }

    renderAddOption() {
        if (this.props.displayAddOption) {
            return (
                <div className="row add-option">
                    <Select
                        className="col-md-6"
                        label="Camp Lead"
                        name="leadField_add"
                        options={this.getRemainingTemplateOptions()}
                        onChange={this.handleOptionChange}
                        autocomplete
                    />
                    <Text
                        className="col-md-5 text-input"
                        label="Numar Coloana"
                        name="columnNumber_add"
                        type="number"
                    />
                    <i
                        className="clickable ion-ios-add-circle-outline col-md-1"
                        onClick={this.handleAddClick}
                    />
                </div>
            );
        }
    }

    render() {
        return (
            <Fragment>
                {this.renderTemplate()}
                {this.renderAddOption()}
            </Fragment>
        );
    }
}

export default TemplateDetails;
