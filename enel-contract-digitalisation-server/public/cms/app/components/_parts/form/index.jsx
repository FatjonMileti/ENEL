import React from 'react';
// import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import _ from 'lodash';

//TODO: Add PropTypes

const FormRow = (props) => <div className="form-row"> {props.children} </div>;

export default (props) => {
    let { that, fields } = props;

    // update fields
    const updateInputValue = (e, fieldDispatch = false, triggingMethod = false) => {
        let t = e.target;
        let name = t.name;
        let val = t.type === 'checkbox' ? t.checked : t.value;
        that.setState(prevState => ({
            formData: {
                ...that.initialFormData,
                ...prevState.formData,
                [name]: val
            }
        }));

        // select with fetched options
        fieldDispatch && that.props[fieldDispatch](val);

        //select with triggingMethod
        triggingMethod && that[triggingMethod]();
    }

    let fieldSets = fields.map((field, i) => {
        let l = field.required ? '* ' : '';
        let p = field.label && field.label.toUpperCase();
        let label = l + p;

        switch (field.type) {
            case 'checkbox':
                return (
                    <p className="rc-line" key={i}>
                        <input
                            type={field.type}
                            name={field.name}
                            defaultChecked={that.initialFormData[field.name]}
                            onChange={e => updateInputValue(e)}
                            disabled={that.state.disabled}
                        />
                        <label htmlFor={field.name}>{label}</label>
                    </p>
                );
            case 'date':
            case 'datetime':
            case 'datetime-local':
                let date = moment(that.initialFormData[field.name]);
                date = date.isValid() ? date.format('YYYY/MM/DD') : null;
                return (
                    <p className="input-box-field active" key={i}>
                        <label>{label}</label>
                        <input
                            type={field.type}
                            name={field.name}
                            defaultValue={date}
                            onChange={e => updateInputValue(e)}
                            disabled={that.state.disabled}
                        />
                    </p>
                );
            case 'integer':
            case 'password':
            case 'text':
                return (
                    <p className="input-box-field active" key={i}>
                        <label>{label}</label>
                        <input
                            type={field.type}
                            name={field.name}
                            defaultValue={that.initialFormData[field.name]}
                            onChange={e => updateInputValue(e)}
                            disabled={that.state.disabled}
                        />
                    </p>
                );
            case 'textarea':
                return (
                    <p clasName="input-box-field active" key={i}>
                        <label>{label}</label>
                        <textarea
                            name={field.name}
                            defaultValue={that.initialFormData[field.name]}
                            onChange={e => updateInputValue(e)}
                            disabled={that.state.disabled}
                        ></textarea>
                    </p>
                );
            case 'select':
                let value = ((that.state.formData[field.name] || that.initialFormData[field.name]) || field.default) || '';
                if (field.options instanceof Array || field.options === "fetchFromState" || field.options === "fetchWithMethod") {
                    let _options = field.options;
                    if (field.options === "fetchFromState") {
                        _options = that.state[field.optionsState];
                    }
                    if (field.options === "fetchWithMethod") {
                        _options = that[field.feedingMethod]();
                    }
                    let options = _options.map((option, i) =>
                        <option value={option[Object.keys(option)[0]]} key={i}>
                            {Object.keys(option)[0]}
                        </option>
                    );
                    if (value === '' && field.options !== "fetchFromState") {
                        options.push(<option value={''} key=''></option>);
                    }
                    return (
                        <p className="select-box-field active" key={i}>
                            <label>{label}</label>
                            <select
                                name={field.name}
                                value={value}
                                onChange={e => updateInputValue(e, field.dispatch, field.triggingMethod)}
                                disabled={that.state.disabled}
                            > {options} </select>
                        </p>
                    );
                } else {
                    let options = that.props[field.options].map((option, i) => {
                        let label = option[field.oLabel];
                        if (field.oLabel instanceof Array) {
                            label = field.oLabel.reduce((acc, cur) => acc + ` ${option[cur]}`, '');
                        }
                        return <option
                            value={option[field.oValue]}
                            key={i} >
                            {label}
                        </option>;
                    });
                    if (value === '') {
                        options.push(<option value={''} key=''></option>);
                    }
                    return (
                        <p className="select-box-field active" key={i}>
                            <label>{label}</label>
                            <select
                                name={field.name}
                                value={value}
                                onChange={e => updateInputValue(e, field.dispatch)}
                                disabled={that.state.disabled}
                            >
                                {options}
                            </select>
                        </p>
                    );
                }
        }
    });

    let result = []
    for (let i = 0; i < fieldSets.length - 1; i += 2) {
        result.push(
            <FormRow key={i + 'a'}>
                {[fieldSets[i], fieldSets[i + 1]]}
            </FormRow>
        )
    }
    return (
        <form className="form" ref={form => that.form = form}>
            <fieldset>
                {result}
            </fieldset>
        </form>
    );
}

export const transformFieldsInSate = fields => fields.reduce((a, c) => {
    c.name && (a[c.name] = ('default' in c ? c.default : null));
    return a;
}, {});