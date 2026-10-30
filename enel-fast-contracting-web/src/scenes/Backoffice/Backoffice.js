import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { getCurrentPlan } from 'store/offers/selectors';
import { getFlow } from 'store/client/selectors';
import { setFlow } from 'store/client/actions';

import offerService from 'services/offer';
import pageService from 'services/page';

import './Backoffice.scss';

const propTypes = {
    plan: PropTypes.object,
    flow: PropTypes.string,
    setFlow: PropTypes.func.isRequired,
};

const defaultProps = {
    plan: {},
    flow: '',
};

class Backoffice extends Component {

    state = {

    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidMount() {
        document.body.className = 'bg-green multumim-13';

        if (this.shouldContinue()) {
            await this.props.setFlow('GAZ');
            browserHistory.push(pageService.links['client-invoice-scan']);
        } else {
            window.location = 'https://www.ppcenergy.ro/confirmare/contract-rapid-confirmare-contract-backoffice';
        }
    }

    componentWillUnmount() {
        document.body.className = '';
    }

    shouldContinue() {
        const plan = offerService.getPlanDetails(this.props.plan);
        return this.props.flow.toUpperCase() == 'EE' && plan.serviciu.toUpperCase() == 'COMBO';
    }

    render() {
        return (
            <div className="Backoffice"></div>
        );
    }
}

Backoffice.propTypes = propTypes;
Backoffice.defaultProps = defaultProps;

const mapStateToProps = state => ({
    plan: getCurrentPlan(state),
    flow: getFlow(state),
});

const mapDispatchToProps = {
    setFlow,
};

export default connect(mapStateToProps, mapDispatchToProps)(Backoffice);
