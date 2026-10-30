import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import * as offersActions from 'store/offers/actions';
import * as authActions from 'store/auth/actions';
import * as sessionActions from 'store/session/actions';
import { fetchAllItems as fetchStreetTypes } from 'store/streetTypes/actions';
import { showLoading, hideLoading } from '../../store/ui/actions';
import { saveRegistrationPageURL, resetRegistration } from 'store/registration/actions';

import { getItems as getCounties } from 'store/counties/selectors';
import { getItems as getOffers } from 'store/offers/selectors';
import { isLoading } from 'store/ui/selectors';

import pageService from 'services/page';

import _ from 'lodash';

const propTypes = {
    login: PropTypes.func.isRequired,
    fetchStreetTypes: PropTypes.func.isRequired,
    fetchCounties: PropTypes.func.isRequired,
    fetchOffers: PropTypes.func.isRequired,
    setCurrentPlan: PropTypes.func.isRequired,
    setSessionPlan: PropTypes.func.isRequired,
    showLoading: PropTypes.func.isRequired,
    hideLoading: PropTypes.func.isRequired,
    setStep: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
};

const defaultProps = {};

class OfferSelection extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
        this.props.showLoading();
    }

    async componentDidMount() {
        await this.props.resetRegistration();
        this.props.saveRegistrationPageURL(window.location.href);

        this.validateQuery();

        await this.props.login();
        await this.props.resetSession();
        await this.props.createSession();

        this.checkParams(this.props);

        this.props.fetchCounties();
        this.props.fetchStreetTypes();
    }

    componentWillReceiveProps(nextProps) {
        this.checkParams(nextProps);
    }

    componentWillUnmount() {
        this.props.hideLoading();
    }

    checkParams(nextProps) {
        const { judet, cod, denumire, furnizare, tip, isBusiness } = this.props.location.query;

        if (isBusiness) {
            this.handleBusinessOffers();
        } else if (judet && cod && furnizare && tip) {
            this.handleOfferByCode(nextProps);
        } else if (denumire && furnizare && tip) {
            this.handleOfferByName();
        } else if (judet && furnizare) {
            this.handleOptionsSelection(nextProps);
        }
    }

    validateQuery() {
        const { judet, cod, denumire, furnizare, tip, isBusiness } = this.props.location.query;
        let isValid = isBusiness;

        if ((judet && cod && furnizare && tip) || (judet && furnizare) || (denumire && furnizare && tip)) {
            isValid = true;
        }

        if (furnizare && !['12', '24'].includes(furnizare)) {
            isValid = false;
        }

        if (tip && !['ee', 'gaz', 'combo'].includes(tip.toLowerCase())) {
            isValid = false;
        }

        if (!isValid) {
            window.location = '/';
        }
    }

    handleBusinessOffers() {
        const { denumire, furnizare, tip, judet } = this.props.location.query;
        if (denumire || furnizare || tip || judet) {
            this.props.setOfferParams({ denumire, furnizare, tip, judet });
        }
        this.props.setSessionOptions({ type: tip, isBusiness: true });
        this.props.setStep(1);
        browserHistory.push(pageService.links.home);
    }

    handleOfferByCode(nextProps) {
        const { judet, cod, furnizare, tip } = this.props.location.query;

        if (!_.isEmpty(nextProps.counties) && _.isEmpty(this.props.counties)) {
            const { counties } = nextProps;
            const isCountyValid = !!_.find(counties, item => item.denumire.toLowerCase() == judet.toLowerCase());
            if (!isCountyValid) {
                window.location = '/';
            }

            const options = {
                judet: judet.toUpperCase(),
                furn24: (furnizare == 24) ? '1' : '0',
            };

            this.props.setSessionOptions({type: tip, ...options});
            this.props.fetchOffers(options, tip.toUpperCase());
        }

        if (!_.isEmpty(nextProps[`${tip.toLowerCase()}Offers`]) && _.isEmpty(this.props[`${tip.toLowerCase()}Offers`])) {
            const offers = nextProps[`${tip.toLowerCase()}Offers`];
            const isCombo = tip.toLowerCase() == 'combo';
            const offer = isCombo ? _.find(offers, item => item[0] && item[0].cod == cod) : _.find(offers, item => item.cod == cod);
            if (!offer) {
                window.location = '/';
            }
            this.props.setCurrentPlan(isCombo ? offer : [offer]);
            this.props.setSessionPlan(isCombo ? offer : [offer]);
            this.props.setStep(2);
            browserHistory.push(pageService.links.agreement);
        }
    }

    handleOfferByName() {
        const { denumire, furnizare, tip } = this.props.location.query;
        this.props.setOfferParams({ denumire, furnizare, tip });
        this.props.setStep(1);
        browserHistory.push(pageService.links.home);
    }

    async handleOptionsSelection(nextProps) {
        const { judet, furnizare } = this.props.location.query;

        if (!_.isEmpty(nextProps.counties) && _.isEmpty(this.props.counties)) {
            const { counties } = nextProps;
            const isCountyValid = !!_.find(counties, item => item.denumire.toLowerCase() == judet.toLowerCase());
            if (!isCountyValid) {
                window.location = '/';
            }

            const options = {
                judet: judet.toUpperCase(),
                furn24: (furnizare == 24) ? '1' : '0',
            };

            this.props.setSessionOptions(options);
            await this.props.fetchOffers(options, 'EE');
            await this.props.fetchOffers(options, 'GAZ');
            await this.props.fetchOffers(options, 'COMBO');

            this.props.setStep(1);
            browserHistory.push(pageService.links.plans);
        }
    }

    render() {
        return (
            <div className="OfferSelection" />
        );
    }
}

OfferSelection.propTypes = propTypes;
OfferSelection.defaultProps = defaultProps;

const mapStateToProps = state => ({
    counties: getCounties(state),
    eeOffers: getOffers(state, 'EE'),
    gazOffers: getOffers(state, 'GAZ'),
    comboOffers: getOffers(state, 'COMBO'),
    loading: isLoading(state),
});

const mapDispatchToProps = {
    fetchOffers: offersActions.fetchItems,
    setCurrentPlan: offersActions.setCurrentPlan,
    setOfferParams: offersActions.setParams,
    setSessionPlan: sessionActions.setPlan,
    setSessionOptions: sessionActions.setOptions,
    setStep: sessionActions.setStep,
    fetchStreetTypes,
    fetchCounties,
    login: authActions.login,
    createSession: sessionActions.create,
    resetSession: sessionActions.reset,
    showLoading,
    hideLoading,
    saveRegistrationPageURL,
    resetRegistration,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OfferSelection);
