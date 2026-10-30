import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import Autosuggest from 'react-autosuggest';
import { Text } from 'components/form/Text';
import randomstring from 'randomstring';
import escapeStringRegexp from 'escape-string-regexp';
import _ from 'lodash';
import './Select.scss';

interface State {
    suggestions: IOption[];
    isFocused: boolean;
    isFilled: boolean;
    inputKey: string;
}

interface IOption {
    label: string;
}

interface Props {
    options: any;
    name: string;
    autocomplete: boolean;
    className: string;
    label: string;
    initialValue: string;
    disabled: boolean;
    onChange: (object) => void;
    validate: () => void;
    highlight: () => void;
}

export class Select extends Component<Props, State> {
    state: State = {
        suggestions: this.props.options,
        isFocused: false,
        isFilled: false,
        inputKey: randomstring.generate(32),
    };

    formApi = null;

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        window.addEventListener('click', this.handleWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleWindowClick);
    }

    handleWindowClick(e?) {
        return new Promise<void>(resolve => {
            this.setState(
                {
                    isFocused: !!(e && e.payload && e.payload.inputKey === this.state.inputKey),
                },
                () => {
                    resolve();
                }
            );
        });
    }

    getSuggestions(value) {
        const { options, autocomplete } = this.props;
        const MAX_SIZE = 200;
        let suggestions: IOption[] = this.props.options;

        if (!_.isEmpty(options) && value && autocomplete) {
            suggestions = this.props.options.filter(
                item =>
                    !!item.label.toLowerCase().match(escapeStringRegexp(value.toLowerCase()).trim())
            );
        }
        return suggestions.slice(0, MAX_SIZE);
    }

    valueToLabel(value) {
        const suggestion = _.find(this.props.options, item => item.value === value);
        if (suggestion && !this.state.isFocused) {
            return suggestion.label;
        }
        return value;
    }

    labelToValue(label) {
        const suggestion = _.find(this.props.options, item => item.label === label);
        if (suggestion && !this.state.isFocused) {
            return suggestion.value;
        }
        return label;
    }

    clearInvalidValue() {
        const value = this.formApi.getValue(this.props.name);
        if (!_.find(this.props.options, item => item.value === value)) {
            this.formApi.setValue(this.props.name, '');
            this.setState({ isFilled: false });
        }
    }

    render() {
        const { className, label, disabled, initialValue, ...props } = this.props;

        return (
            <div className={`Select ${className}`}>
                <Autosuggest
                    suggestions={this.state.suggestions}
                    onSuggestionsFetchRequested={({ value }) => {
                        this.setState({
                            suggestions: this.getSuggestions(value),
                        });
                    }}
                    onSuggestionsClearRequested={() => {
                        this.setState({ suggestions: [] });
                        this.clearInvalidValue();
                    }}
                    getSuggestionValue={item => item.value}
                    focusInputOnSuggestionClick={false}
                    shouldRenderSuggestions={() => true}
                    alwaysRenderSuggestions={this.state.isFocused && !this.props.autocomplete}
                    renderSuggestion={item => <span>{item.label}</span>}
                    renderInputComponent={inputProps => {
                        return (
                            <Fragment>
                                <Text
                                    {...inputProps}
                                    initialValue={initialValue}
                                    onFormApi={formApi => {
                                        this.formApi = formApi;
                                    }}
                                />
                                {!disabled && (
                                    <i
                                        className={`icon ion-ios-arrow-${
                                            this.state.isFocused ? 'up' : 'down'
                                        }`}
                                    />
                                )}
                            </Fragment>
                        );
                    }}
                    onSuggestionSelected={async (e, { suggestion }) => {
                        if (this.formApi) {
                            await this.handleWindowClick();
                            this.formApi.setValue(this.props.name, suggestion.value);
                            this.setState({ isFilled: true });
                            if (this.props.onChange) {
                                this.props.onChange({
                                    target: {
                                        value: suggestion.value,
                                        name: this.props.name,
                                    },
                                });
                            }
                        }
                    }}
                    inputProps={{
                        label,
                        value: '',
                        name: this.props.name,
                        validate: this.props.validate,
                        highlight: this.props.highlight,
                        disabled: this.props.disabled,
                        format: this.valueToLabel,
                        parse: this.labelToValue,
                        onChange: () => {},
                        onClick: e => {
                            e.nativeEvent.payload = {
                                inputKey: this.state.inputKey,
                            };
                        },
                        readOnly: !this.props.autocomplete,
                        className: this.state.isFilled ? 'filled' : '',
                    }}
                    {...props}
                />
            </div>
        );
    }
}
