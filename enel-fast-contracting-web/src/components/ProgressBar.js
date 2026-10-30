import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';

import { dataURLtoBlob } from 'utils';
import {
    getTotalSteps, getCurrentStep,
    getTotalComboSteps, getCurrentComboStep,
} from 'store/ui/selectors';
import { isCombo } from 'store/offers/selectors';

import './ProgressBar.scss';

const propTypes = {
    totalSteps: PropTypes.number,
    currentStep: PropTypes.number,
};

const defaultProps = {
    totalSteps: 1,
    currentStep: 1,
};

class ProgressBar extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    getTitle() {
        if (this.props.currentStep == 0) {
            return '';
        }

        return `Pasul ${this.props.currentStep}/${this.props.totalSteps}`;
    }

    render() {
        return (
            <div className="ProgressBar">
                <div className="step">
                    <span className="eyebrow georgia">{this.getTitle()}</span>
                </div>
            </div>
        );
    }
}

ProgressBar.propTypes = propTypes;
ProgressBar.defaultProps = defaultProps;

const mapStateToProps = state => ({
    currentStep: isCombo(state) ? getCurrentComboStep(state) : getCurrentStep(state),
    totalSteps: isCombo(state) ? getTotalComboSteps(state) : getTotalSteps(state),
});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(ProgressBar);
