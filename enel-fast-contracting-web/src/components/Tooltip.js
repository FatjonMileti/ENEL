import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';

const propTypes = {
    info: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    info: '',
    onClick: () => {},
};

class Tooltip extends Component {

    constructor(props) {
        super(props);
        autoBind(this);
    }

    render() {
        return (
            <span className="Tooltip tooltip-container" onClick={this.props.onClick}>
                i
                <span className="tooltip-message">
                    {this.props.info}
                </span>
            </span>
        );
    }
}

Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;

export default Tooltip;
