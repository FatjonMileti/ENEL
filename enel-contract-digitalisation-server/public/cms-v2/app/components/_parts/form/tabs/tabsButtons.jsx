import React, { Component } from 'react';
import api from '../../../../api';

//TODO: Add PropTypes

const TabsButtons = props => {
    let { that } = props;
    let isNew = that.props.match.params.id === 'new';

    const fillErrors = (errors, k, message = 'is not correct') => {
        errors.push(<p key={errors.length}>{k.toUpperCase()} {message}</p>);
        return errors;
    }

    const validate = async () => {
        let errors = [];

        const transformFieldsInValidationObject = fields => fields.reduce((a, c) => {
            (c.name && c.label) && (a[c.name] = {
                label: c.label,
                required: ('required' in c),
                rule: ('rule' in c) ? c.rule : null
            });
            return a;
        }, {});

        // TODO: consider to implode
        const f = that.state.formData;
        const requiredFields = transformFieldsInValidationObject(props.fields);
        let reg;
        for (let [k, v] of Object.entries(requiredFields)) {
            if (f[k] === undefined || f[k] === null || f[k] === '') {
                v.required && (errors = fillErrors(errors, k, 'is required'));
            }

            switch (v.rule) {
                case "unicity":
                    if (f[k] !== that.initialFormData[k]) {
                        let valueExists = await api.common.find(props.collection, `${k}=${f[k]}`);
                        if (valueExists.total > 0) {
                            errors = fillErrors(errors, k, 'already exists');
                        }
                    }
                    break;
                case "phone":
                    if (f[k] !== undefined && f[k] !== null && f[k] !== '') {
                        // node-validator phone regexp
                        reg = /^(\+?4?0)\s?7\d{2}(\/|\s|\.|\-)?\d{3}(\s|\.|\-)?\d{3}$/;
                        if (!reg.test(f[k]))
                            errors = fillErrors(errors, k);
                    }
                    break;
                case "email":
                    if (f[k] !== undefined && f[k] !== null && f[k] !== '') {
                        reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (!reg.test(f[k]))
                            errors = fillErrors(errors, k);
                    }
                    break;
            }
        }
        return errors;
    }

    //edit fields then [post or patch] or cancel
    const editFields = async (e, redirect = false) => {
        if (that.state.isLoading) return;
        e.preventDefault();
        let bText = e.currentTarget.textContent;
        switch (bText) {
            case "Save":
                let id = that.id;
                let action;

                // new form has empty state
                let formData = that.state.formData;
                if (Object.keys(formData).length === 0) {
                    formData = that.initialFormData;
                }

                let errors;
                errors = await validate();
                if (errors.length) {
                    that.setState({
                        errorsShow: true,
                        errors: errors
                    });
                    break;
                }
                if (id === 'new') {
                    that.setState({ isLoading: true });
                    formData['id'] = null;
                    action = await api.common.post(props.collection, formData);
                    that.setState({ isLoading: false });
                    redirect = true;
                } else {
                    that.setState({ isLoading: true });
                    action = await api.common.patch(props.collection, id, formData);
                    that.setState({ isLoading: false });
                }
                // }

                // success
                if (redirect) {
                    return props.navigate(that.allHistory);
                } else {
                    that.initialFormData = formData;
                    that.setState({
                        disabled: !that.state.disabled,
                        hide: !that.state.hide,
                        errorsShow: false,
                        errors: []
                    });
                }
                break;
            case "Cancel":
                if (redirect) {
                    return props.navigate(that.allHistory);
                } else {
                    that.form.reset();
                    that.setState({
                        formData: that.initialFormData,
                        disabled: !that.state.disabled,
                        hide: !that.state.hide,
                        errorsShow: false,
                        errors: []
                    });
                }
                break;
            default:
                that.setState({
                    disabled: !that.state.disabled,
                    hide: !that.state.hide,
                    formData: that.initialFormData
                });
        }
    }

    return (
        <div className={props.tabClass}>
            <a
                className="button black"
                onClick={e => editFields(e)}>
                {that.state.disabled ? props.initSaveButton : 'Save'}
            </a>
            <a
                className={`${that.state.hide && 'hidden '} button white `}
                onClick={e => editFields(e, isNew)}>
                Cancel
            </a>
        </div>
    );
}

export default TabsButtons;
