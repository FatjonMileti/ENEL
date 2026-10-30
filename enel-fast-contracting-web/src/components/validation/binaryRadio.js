import React from 'react';
import PropTypes from 'prop-types';
import control from './hocs/control';
import _ from 'lodash';

import Tooltip from 'components/Tooltip'

const BinaryRadio = ({
    error, isChanged, isUsed, ...props
}) => {

    const classes = (isChanged && isUsed && error) ? `has-error ${props.containerClass}` : props.containerClass;

    const {
        errorLabel, label, onAgree, onDisagree, values, valueLabels, tooltip,
    } = props;

    delete props.errorLabel;
    delete props.containerClass;
    delete props.label;
    delete props.onAgree;
    delete props.onDisagree;
    delete props.values;
    delete props.valueLabels;
    delete props.tooltip;

    const sub = (isChanged && isUsed && error) ? (
        <div className="invalid-feedback shown">
            <span>{errorLabel}</span>
        </div>
    ) : null;

    let tooltipHtml = '';
    if (tooltip != '') {
        tooltipHtml = (
            <Tooltip
                info={tooltip}
            />
        );
    }

    return (
        <div className={classes}>
            <label htmlFor={props.name}>{label} {tooltipHtml}</label>
            <div className="btn-group" data-toggle="buttons">
                <label className={`btn btn-secondary ${props.value === values[0] && 'active'}`} onClick={onAgree}>
                    <input type="radio" /> {valueLabels[0]}
                </label>
                <label className={`btn btn-secondary ${props.value === values[1] && 'active'}`} onClick={onDisagree}>
                    <input type="radio" /> {valueLabels[1]}
                </label>
            </div>
            {sub}
        </div>
    );
};

BinaryRadio.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
    error: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    isChanged: PropTypes.bool,
    isUsed: PropTypes.bool,
    containerClass: PropTypes.string,
    errorLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    type: PropTypes.string,
    onAgree: PropTypes.func.isRequired,
    onDisagree: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    values: PropTypes.array,
    valueLabels: PropTypes.array,
    tooltip: PropTypes.string,
};

BinaryRadio.defaultProps = {
    error: null,
    isChanged: false,
    isUsed: false,
    containerClass: '',
    errorLabel: '',
    type: 'text',
    value: null,
    values: [true, false],
    valueLabels: ['da', 'nu'],
    tooltip: '',
};

export default control(BinaryRadio);
