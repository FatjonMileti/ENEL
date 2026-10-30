import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import * as authActions from 'store/auth/actions';
import * as sessionActions from 'store/session/actions';
import { getSession, getStep } from 'store/session/selectors';
import { setCurrentPlan, fetchItems as fetchOffers } from 'store/offers/actions';
import { setFlow, validateNLC } from 'store/client/actions';
import { isLoading } from 'store/ui/selectors';
import { showLoading, hideLoading } from 'store/ui/actions';

import pageService from 'services/page';

const propTypes = {
    resetSession: PropTypes.func.isRequired,
    restoreSession: PropTypes.func.isRequired,
    setCurrentPlan: PropTypes.func.isRequired,
    fetchOffers: PropTypes.func.isRequired,
    setSessionOptions: PropTypes.func.isRequired,
    setFlow: PropTypes.func.isRequired,
    validateNLC: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    showLoading: PropTypes.func.isRequired,
    hideLoading: PropTypes.func.isRequired,
};

const defaultProps = {};

class RestoreSession extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
        this.props.showLoading();
    }

    async componentDidMount() {
        const { id, hash } = this.props.location.query;

        if (!id || !hash) {
            window.location = '/';
        }

        await this.props.login();
        await this.props.resetSession();
        this.props.showLoading();
        try {
            await this.props.restoreSession({ id, hash });
        } catch (error) {
            window.location = '/';
        }

        const { session } = this.props;

        if (session[`${session.type.toLowerCase()}_agree`] && session.is_closed) {
            window.location = `${process.env.REACT_API_URL}/landing/${hash}/${session.id}?type=${session.type}`;
        }

        const options = {
            judet: session.judet,
            furn24: session.perioada_furnizare === 24 ? '1' : '0',
        };
        if(session.contract_type === 'b2b'){
            options.segment = 'BUSINESS'
        }

        // await this.props.setSessionOptions(options);
        await this.props.fetchOffers(options, 'EE');
        await this.props.fetchOffers(options, 'GAZ');
        await this.props.fetchOffers(options, 'COMBO');

        if (session.ee_serviciu || session.gaz_serviciu) {
            const plan = [session.ee_serviciu, session.gaz_serviciu].filter(item => item);
            await this.props.setCurrentPlan(plan);
        }

        if (['EE', 'GAZ'].includes(session.type)) {
            await this.props.setFlow(session.type);
        }

        if (session[`${session.type.toLowerCase()}_loc`] && session[`${session.type.toLowerCase()}_loc`].cod_pod) {
            const code = session[`${session.type.toLowerCase()}_loc`].cod_pod;
            await this.props.validateNLC(code);
        }

        browserHistory.push(pageService.getPageFromStep(this.props.step));
    }

    componentWillUnmount() {
        this.props.hideLoading();
    }
    render() {
        return <div className="RestoreSession"></div>;
    }
}

RestoreSession.propTypes = propTypes;
RestoreSession.defaultProps = defaultProps;

const mapStateToProps = state => ({
    session: getSession(state),
    step: getStep(state),
    loading: isLoading(state),
});

const mapDispatchToProps = {
    login: authActions.login,
    restoreSession: sessionActions.restore,
    resetSession: sessionActions.reset,
    setSessionOptions: sessionActions.setOptions,
    fetchOffers,
    setCurrentPlan,
    setFlow,
    validateNLC,
    hideLoading,
    showLoading,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RestoreSession);
