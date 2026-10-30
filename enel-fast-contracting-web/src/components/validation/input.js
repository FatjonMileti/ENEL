
import React from 'react';
import PropTypes from 'prop-types';
import control from './hocs/control';
import _ from 'lodash';
import autoBind from 'react-autobind';
import DatePicker from 'components/datepicker';
import moment from 'moment';

class Input extends React.Component {
    state = {
        isOpen: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    openPicker() {
        this.setState({
            isOpen: true,
        });
    }

    closePicker() {
        this.setState({
            isOpen: false,
        });
    }

    handleInputChange(e) {
        if (this.props.upperCase) {
            e.target.value = e.target.value.toUpperCase();
        }
        this.props.onChange(e);
    }

    selectDate(date) {
        const dateString = moment(date).format('YYYY-MM-DD');
        const e = {
            target: {
                name: this.props.name,
                value: dateString,
            },
        };
        this.props.onChange(e);
    }

    render() {
        const props = { ...this.props };
        const { isChanged, isUsed, error } = props;
        const classes = (isChanged && isUsed && error) ? `has-error ${props.containerClass}` : props.containerClass;

        const { errorLabel, label, type } = props;

        delete props.errorLabel;
        delete props.containerClass;
        delete props.label;
        delete props.isChanged;
        delete props.isUsed;
        delete props.dateFormat;
        delete props.onChange;
        delete props.upperCase;

        if (type == 'date') {
            props.type = 'text';
            props.onFocus = (e) => {
                e.preventDefault();
                this.openPicker();
                e.target.blur();
            };

            if (moment(props.value, 'YYYY-MM-DD', true).isValid()) {
                props.value = moment(props.value).format(this.props.dateFormat);
            }
            props.date = moment(props.value, this.props.dateFormat).toDate();
        }

        if (type == 'number') {
            props.pattern = '[0-9]*';
        }

        const sub = (isChanged && isUsed && error) ? (
            <div className="invalid-feedback shown">
                <span>{error}</span>
            </div>
        ) : null;

        const datepicker = type == 'date' ?
            (
                <DatePicker
                    isOpen={this.state.isOpen}
                    value={props.date}
                    handleClosePicker={this.closePicker}
                    handleSelectDate={this.selectDate}
                />
            ) : null;

        return (
            <div className={classes}>
                {label && <label htmlFor={props.name}>{label}</label>}
                <input className="form-control" onChange={this.handleInputChange} {...props} ref={this.props.innerRef} />
                {sub}
                {datepicker}
            </div>
        );
    }
}

Input.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    error: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    isChanged: PropTypes.bool,
    isUsed: PropTypes.bool,
    containerClass: PropTypes.string,
    errorLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    type: PropTypes.string,
    dateFormat: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    upperCase: PropTypes.bool,
};

Input.defaultProps = {
    error: null,
    label: null,
    isChanged: false,
    isUsed: false,
    containerClass: '',
    errorLabel: '',
    type: 'text',
    dateFormat: 'YYYY-MM-DD',
    upperCase: false,
};

export default control(Input);
