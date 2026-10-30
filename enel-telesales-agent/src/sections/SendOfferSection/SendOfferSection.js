import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import moment from 'moment';
import _ from 'lodash';

import { getItems as getProviders } from 'store/providers/selectors';
import { setCityOffers, setOffers } from 'store/offer/actions';
import { getItems as getCounties } from 'store/counties/selectors';
import { getCurrentPlan, getItems as getOffers, isPlanSelected } from 'store/offers/selectors';
import { getFlow, getSession } from 'store/session/selectors';
import { isFastFlux, isLinkSent } from 'store/client/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { clearCache as clearOffers, fetchItems as fetchOffers } from 'store/offers/actions';
import { patch as patchSession, setOptions as setSessionOptions } from 'store/session/actions';
import {
    clearCache as clearCampaigns,
    fetchAllItems as fetchCampaigns,
} from 'store/campaigns/actions';
import { setSessionLink } from 'store/client/actions';

import { requiredBefore } from 'services/rules';
import offerService from 'services/offer';
import pageService from 'services/page';
import {
    addFormError,
    checkForm,
    getCountyOptions,
    noFormErrors,
    resetFormErrors,
} from 'services/form';

import Section from 'components/Section';
import { Form, FormErrors, Select } from 'components/form';
import { Button } from 'components/Button';
import PlanDetailsModal from 'components/modals/PlanDetailsModal';
import OfferList from 'components/OfferList';
import OfferCard from 'components/OfferCard';

class SendOfferSection extends Component {
    static propTypes = {
        onPlanSelect: PropTypes.func.isRequired,
    };

    formErrors = {
        validity: [],
    };

    state = {
        isValid: true,
        formErrors: this.formErrors,
        showOffers: false,
        selectedPlan: null,
        dataLoaded: false,
        judet: null,
        offer: null,
        plan: null,
        isPlanSelected: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidUpdate(prevProps) {
        const { session, isEdit } = this.props;
        if (!_.isEmpty(session) && this.formApi && !this.state.dataLoaded) {
            if (isEdit) {
                this.setState({ dataLoaded: true }, async () => {
                    await this.setValues();
                    this.loadSessionOptions();
                });
            } else {
                this.setState({ dataLoaded: true }, async () => {
                    await this.setValues();
                });
            }
        }
    }

    loadSessionOptions() {
        const { session } = this.props;
        if (session.type) {
            this.formApi.setValue('tip', session.type);
        }
        if (session.perioada_furnizare) {
            this.formApi.setValue('furnizare', session.perioada_furnizare);
        }
    }

    async setValues() {
        const { ee_loc, gaz_loc } = this.props.session;

        this.formApi.setValue('furnizare', 12);
        if (!_.isEmpty(ee_loc) && !_.isEmpty(gaz_loc)) {
            this.formApi.setValue('tip', 'COMBO');
        } else if (!_.isEmpty(ee_loc)) {
            this.formApi.setValue('tip', 'EE');
        } else if (!_.isEmpty(gaz_loc)) {
            this.formApi.setValue('tip', 'GAZ');
        }
    }

    async handleCountyChange(e, prefix) {
        this.setState(state => ({ ...state, judet: e.target.value }));
        await this.props.setCityOffers(e.target.value);
        await this.props.fetchCities(e.target.value);
        this.formApi.setValues({
            [`${prefix}localitate`]: '',
            [`${prefix}strada`]: '',
        });
    }

    setFormApi(formApi) {
        this.formApi = formApi;
    }

    isValid() {
        return this.state.isValid && noFormErrors(this);
    }

    showOffers() {
        this.setState({ showOffers: true });
    }

    hideOffers() {
        this.setState({ showOffers: false });
    }

    async validateOfferValidity() {
        const { session, flow } = this.props;
        const contractStart = moment(session[`${flow}_furnizor_data_start`], 'YYYY-MM-DD');
        const contractExpire = moment(session[`${flow}_furnizor_data_start`], 'YYYY-MM-DD').add(
            session.perioada_furnizare,
            'months'
        );
        const offerStart = moment(session[`${flow}_serviciu`].de_la_furn);
        const offerExpire = moment(session[`${flow}_serviciu`].pana_la_furn);

        if (
            contractStart.add(1, 'day').isBefore(offerStart) ||
            contractExpire.isAfter(offerExpire.add(1, 'day'))
        ) {
            await addFormError(
                this,
                'validity',
                'Perioada de furnizare nu este compatibilă cu oferta, vă rugăm selectați o altă dată de start furnizare sau schimbați oferta.'
            );
        }
    }

    async validateOfferPOD() {
        const plan = offerService.getPlanDetails(this.props.plan);
        const { ee_loc, gaz_loc } = this.props.session;

        if (plan.serviciu === 'EE' && (_.isEmpty(ee_loc) || !ee_loc.cod_pod)) {
            await addFormError(
                this,
                'validity',
                'Codul POD trebuie completat pentru acest tip de oferta.'
            );
        } else if (plan.serviciu === 'GAZ' && (_.isEmpty(gaz_loc) || !gaz_loc.cod_pod)) {
            await addFormError(
                this,
                'validity',
                'Codul CLC trebuie completat pentru acest tip de oferta.'
            );
        } else if (plan.serviciu === 'COMBO') {
            if (_.isEmpty(ee_loc) || !ee_loc.cod_pod) {
                await addFormError(
                    this,
                    'validity',
                    'Codul POD trebuie completat pentru acest tip de oferta.'
                );
            } else if (_.isEmpty(gaz_loc) || !gaz_loc.cod_pod) {
                await addFormError(
                    this,
                    'validity',
                    'Codul CLC trebuie completat pentru acest tip de oferta.'
                );
            }
        }
    }

    async handleNextClick() {
        await resetFormErrors(this);
        await checkForm(this);
        if (this.isValid()) {
            this.showOffers();
            this.props.clearOffers();
            const { tip, furnizare } = this.formApi.getState().values;
            let { judet } = this.props.session;
            //this.setState((state)=>({...state,isPlanSelected: !state.isPlanSelected}))
            if (!judet) {
                judet = this.state.judet;
            }

            const options = {
                judet: judet.toUpperCase(),
                furn24: furnizare === 24 ? '1' : '0',
            };
            this.props.setSessionOptions(options);

            if (tip) {
                await this.props.fetchOffers(options, tip.toUpperCase());
            } else {
                await this.props.fetchOffers(options, 'EE');
                await this.props.fetchOffers(options, 'GAZ');
                await this.props.fetchOffers(options, 'COMBO');
            }
        } else {
            pageService.scrollToError();
        }
    }

    handleMoreClick(e, plan) {
        e.preventDefault();
        this.setState({ selectedPlan: Array.isArray(plan) ? plan : [plan] });
        this.detailsModal.current.show();
    }

    async handleOfferSelect(e, offer) {
        this.setState(state => ({ ...state, offer }));
        await this.props.setOffers(offer);
        try {
            const plan = Array.isArray(offer) ? offer : [offer];
            this.hideOffers();
            this.setState(state => ({ ...state, plan, isPlanSelected: true }));
            await resetFormErrors(this);
        } catch (error) {}
    }

    renderSelectedOffer() {
        const { isPlanSelected, plan } = this.state;
        if (isPlanSelected) {
            const planDetails = offerService.getPlanDetails(plan);
            return (
                <OfferCard
                    plan={plan}
                    type={planDetails.serviciu.toLowerCase()}
                    disableSelection
                    disableMore
                />
            );
        }
    }

    render() {
        const { isLinkSent } = this.props;
        return (
            <Fragment>
                <Section
                    title="Opțiuni Ofertare"
                    step={this.props.step}
                    isCurrent={this.props.isCurrent}
                    show={this.props.show}
                    className="SendOfferSection"
                >
                    <PlanDetailsModal
                        ref={this.detailsModal}
                        plan={this.state.selectedPlan}
                        onSelect={this.handleOfferSelect}
                        onHide={this.handleDetailsModalHide}
                    />
                    <OfferList
                        show={this.state.showOffers}
                        eeOffers={this.props.eeOffers}
                        gazOffers={this.props.gazOffers}
                        comboOffers={this.props.comboOffers}
                        onClose={this.hideOffers}
                        onSelect={this.handleOfferSelect}
                        onMore={this.handleMoreClick}
                    />
                    <FormErrors errors={this.state.formErrors['validity']} />
                    <Form autoComplete="off" getApi={this.setFormApi}>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="row">
                                    <Select
                                        className="col-md-12"
                                        label="Tip Energie"
                                        name="tip"
                                        options={[
                                            {
                                                value: '',
                                                label: 'Toate',
                                            },
                                            {
                                                value: 'EE',
                                                label: 'Electricitate',
                                            },
                                            {
                                                value: 'GAZ',
                                                label: 'Gaz',
                                            },
                                            {
                                                value: 'COMBO',
                                                label: 'Combo',
                                            },
                                        ]}
                                        disabled={isLinkSent}
                                        highlight={!isLinkSent}
                                    />
                                </div>
                                <div className="row">
                                    <Select
                                        className="col-md-12"
                                        label="Perioada Furnizare"
                                        name="furnizare"
                                        options={[
                                            { label: '12 luni', value: 12 },
                                            { label: '24 luni', value: 24 },
                                        ]}
                                        validate={requiredBefore(isLinkSent)}
                                        disabled={isLinkSent}
                                        highlight={!isLinkSent}
                                    />
                                </div>
                                <div className="row">
                                    <Select
                                        className="col-md-12"
                                        label="Județ"
                                        name="client_judet"
                                        options={getCountyOptions(this.props.counties)}
                                        onChange={e => this.handleCountyChange(e, 'client_')}
                                        validate={requiredBefore(isLinkSent)}
                                        disabled={isLinkSent}
                                        highlight={!isLinkSent}
                                        autocomplete
                                    />
                                </div>
                            </div>
                            <div className="col-md-7 offset-md-1">
                                {this.props.plan ? this.renderSelectedOffer() : ''}
                            </div>
                        </div>
                        {!isLinkSent && (
                            <div className="spaced-top">
                                <Button primary value="Continua" onClick={this.handleNextClick} />
                            </div>
                        )}
                    </Form>
                </Section>
            </Fragment>
        );
    }
}

//kjkjvdkjs
const mapStateToProps = state => ({
    cities: getCities(state),
    counties: getCounties(state),
    eeOffers: getOffers(state, 'EE'),
    gazOffers: getOffers(state, 'GAZ'),
    comboOffers: getOffers(state, 'COMBO'),
    session: getSession(state),
    flow: getFlow(state).toLowerCase(),
    plan: getCurrentPlan(state),
    eeProviders: getProviders(state, 'ee'),
    gazProviders: getProviders(state, 'gaz'),
    isPlanSelected: isPlanSelected(state),
    isLinkSent: isLinkSent(state),
    isFastFlux: isFastFlux(state),
});

const mapDispatchToProps = {
    fetchOffers,
    fetchCampaigns,
    clearOffers,
    clearCampaigns,
    setSessionOptions,
    setSessionLink,
    patchSession,
    fetchCities,
    setOffers,
    setCityOffers,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendOfferSection);
