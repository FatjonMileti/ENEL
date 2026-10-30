import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Autocomplete from './components/autocomplete';

import './Select.scss';

class Select extends Component {
    state = {
        isOpen: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    shouldItemRender(item, value) {
        if (!this.props.autocomplete) {
            return true;
        }
        return item.value && item.label.toLowerCase().indexOf(value.toString().toLowerCase()) > -1;
    }

    handleMenuVisibilityChange(isOpen) {
        this.setState({ isOpen });
        if (!isOpen) {
            if (
                !_.find(
                    this.props.items,
                    item => item.value && item.value.toString() == this.props.value.toString()
                )
            ) {
                this.handleSelect('');
            }
        }
    }

    handleSelect(value) {
        this.props.onSelect({ target: { name: this.props.name, value } });
        document.querySelectorAll('input').forEach(input => input.blur());
    }

    handleArrowClick() {
        if (this.state.isOpen) {
            document.querySelectorAll('input').forEach(input => input.blur());
        }
    }

    renderArrow() {
        if (!this.props.disabled) {
            return (
                <i
                    className={`${this.state.isOpen ? 'icon-chevron-up' : 'icon-chevron-down'}`}
                    onClick={this.handleArrowClick}
                />
            );
        }
    }

    render() {
        const { error, isChanged, isUsed } = this.props;
        let classes =
            isChanged && isUsed && error
                ? `has-error ${this.props.containerClass}`
                : this.props.containerClass;

        classes = `Select ${classes}`;

        const { errorLabel, label, autocomplete, items } = this.props;

        const sub =
            isChanged && isUsed && error ? (
                <div className="invalid-feedback shown">
                    <span>{error}</span>
                </div>
            ) : null;

        return (
            <div className={classes}>
                {label && <label htmlFor={this.props.name}>{label}</label>}
                <Autocomplete
                    getItemValue={item => item.value}
                    items={items}
                    renderItem={(item, isHighlighted) => {
                        const value = _.upperCase(this.props.value);
                        let itemLabel = <b>{item.label}</b>;
                        if (value.length > 0) {
                            const split = new RegExp(`(${value})`, 'i');
                            const values = item.label.split(split);

                            if (autocomplete) {
                                itemLabel =
                                    values.length > 1 ? (
                                        <span key={item.value}>
                                            {_.map(values, (v, k) =>
                                                _.upperCase(v) == _.upperCase(value) ? (
                                                    <b key={`${item.value}${k}`}>{v}</b>
                                                ) : (
                                                    <span key={`${item.value}${k}`}>{v}</span>
                                                )
                                            )}
                                        </span>
                                    ) : (
                                        <b>{item.label}</b>
                                    );
                            } else {
                                itemLabel = <b>{item.label}</b>;
                            }
                        }
                        return (
                            <div
                                key={item.value}
                                className="item"
                                style={{ background: isHighlighted ? '#efefef' : 'white' }}
                            >
                                {itemLabel}
                            </div>
                        );
                    }}
                    renderInput={inputProps => {
                        const selected = _.find(
                            items,
                            item =>
                                item.value && item.value.toString() == this.props.value.toString()
                        );
                        const displayValue = selected ? selected.label : this.props.value;

                        let className = this.props.className || '';

                        if (autocomplete) {
                            inputProps.onChange = e => {
                                if (this.props.upperCase) {
                                    e.target.value = e.target.value.toUpperCase();
                                }
                                this.props.onChange(e);
                            };
                        } else {
                            inputProps.onChange = () => {};
                            className = `${className} selector`;
                        }

                        return (
                            <span className="input-wrapper">
                                <input
                                    {...inputProps}
                                    className={className}
                                    placeholder={this.props.placeholder}
                                    disabled={this.props.disabled}
                                    value={displayValue}
                                />
                                {this.renderArrow()}
                            </span>
                        );
                    }}
                    menuStyle={{
                        border: '2px solid rgba(0, 0, 0, 0.15)',
                        borderRadius: '0px',
                        boxShadow: '0',
                        background: '#ffffff',
                        position: 'absolute',
                        overflow: 'auto',
                        maxHeight: '219px', // TODO: don't cheat, let it flow to the bottom
                        zIndex: '9999',
                        cursor: 'pointer',
                    }}
                    wrapperProps={{
                        className: 'custom-autocomplete ',
                    }}
                    shouldItemRender={this.shouldItemRender}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    onSelect={this.handleSelect}
                    onMenuVisibilityChange={this.handleMenuVisibilityChange}
                />
                {sub}
            </div>
        );
    }
}

Select.propTypes = {
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    error: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    isChanged: PropTypes.bool,
    isUsed: PropTypes.bool,
    containerClass: PropTypes.string,
    errorLabel: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    type: PropTypes.string,
    placeholder: PropTypes.string,
    autocomplete: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    items: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    upperCase: PropTypes.bool,
};

Select.defaultProps = {
    error: null,
    label: null,
    isChanged: false,
    isUsed: false,
    containerClass: '',
    className: '',
    errorLabel: '',
    type: 'text',
    placeholder: '',
    autocomplete: false,
    disabled: false,
    upperCase: false,
    onChange: () => {},
    onSelect: () => {},
};

export default Select;
