/* eslint-disable linebreak-style */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import moment from 'moment';
import _ from 'lodash';

import { getItems as getProviders } from 'store/providers/selectors';
import { getItems as getCounties } from 'store/counties/selectors';
import { getItems as getOffers, getCurrentPlan, isPlanSelected } from 'store/offers/selectors';
import { getItems as getDiscounts } from 'store/discounts/selectors';
import { getItems as getCampaigns } from 'store/campaigns/selectors';
import { getSession, getFlow } from 'store/session/selectors';
import { isLinkSent, isFastFlux, getNLC } from 'store/client/selectors';

import {
    fetchItems as fetchOffers,
    clearCache as clearOffers,
    setCurrentPlan,
} from 'store/offers/actions';
import { setPlan as setSessionPlan, setOptions as setSessionOptions } from 'store/session/actions';
import {
    fetchAllItems as fetchCampaigns,
    clearCache as clearCampaigns,
} from 'store/campaigns/actions';
import {
    fetchAllItems as fetchDiscounts,
    clearCache as clearDiscounts,
} from 'store/discounts/actions';

import { patch as patchSession } from 'store/session/actions';
import { setSessionLink } from 'store/client/actions';

import { requiredBefore } from 'services/rules';
import offerService from 'services/offer';
import pageService from 'services/page';
import { addFormError, noFormErrors, resetFormErrors, checkForm } from 'services/form';

import Section from 'components/Section';
import { Form, Select, Text, FormErrors } from 'components/form';
import { Button } from 'components/Button';
import PlanDetailsModal from 'components/modals/PlanDetailsModal';
import OfferList from 'components/OfferList';
import OfferCard from 'components/OfferCard';

class PlanOptionsSection extends Component {
    static propTypes = {
        onPlanSelect: PropTypes.func.isRequired,
    };

    formErrors = {
        validity: [],
    };

    state = {
        isValid: true,
        formErrors: this.formErrors,
        errors: [],
        showOffers: false,
        selectedPlan: null,
        dataLoaded: false,
    };

    saveModal = React.createRef();
    detailsModal = React.createRef();

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
        } else if (
            plan.serviciu.toUpperCase() === 'GAZ' &&
            (_.isEmpty(gaz_loc) || !gaz_loc.cod_pod)
        ) {
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

    handleDetailsModalHide() {
        this.setState({ selectedPlan: null });
    }

    async handleNextClick() {
        await resetFormErrors(this);
        await checkForm(this);
        if (this.isValid()) {
            this.showOffers();
            this.props.clearOffers();
            const { tip, furnizare } = this.formApi.getState().values;
            const { session } = this.props;
            const { judet, contract_type } = session;
            const options = {
                judet: judet.toUpperCase(),
                furn24: furnizare === 24 ? '1' : '0',
            };

            if (contract_type === 'b2b') {
                options.segment = 'BUSINESS';
            }
            this.props.setSessionOptions(options);
            const place =
                session.ee_loc && Object.keys(session.ee_loc).length > 0
                    ? session.ee_loc
                    : session.gaz_loc;
            const nlc = this.props.nlc[place.cod_pod];
            options.sessionID = session.id;
            options.status = nlc.status;
            options.consum_anual_estimat = place.cantitate_anuala;
            if (nlc.piata) {
                options.piata = nlc.piata;
            }
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
        try {
            const plan = Array.isArray(offer) ? offer : [offer];
            const { session, isFastFlux } = this.props;
            this.hideOffers();
            await this.props.beforePlanSelect();
            try {
                await this.props.setSessionPlan(plan);
            } catch (e) {
                this.setState({
                    errors: [e.message],
                });
                return;
            }

            await this.props.setCurrentPlan(plan);

            await resetFormErrors(this);
            await this.validateOfferValidity();
            await this.validateOfferPOD();

            if (noFormErrors(this)) {
                if (isFastFlux) {
                    await this.props.patchSession({
                        link_sent_date: 'NOW',
                        signature_agree_date: 'NOW',
                        client_upload_agree_date: 'NOW',
                        is_fast_flow: true,
                    });
                    this.props.setSessionLink(session);
                }

                let shouldScroll = false;
                /* await this.props.clearCampaigns();
                await this.props.fetchCampaigns();
                if (Object.keys(this.props.campaigns).length > 0) shouldScroll = true; */
                await this.props.clearDiscounts();
                await this.props.fetchDiscounts();
                if (Object.keys(this.props.discounts).length > 0) shouldScroll = true;

                this.props.onPlanSelect(plan);
                if (shouldScroll) this.props.goToStep(1);
            }
        } catch (error) {}
    }

    renderSelectedOffer() {
        const { isPlanSelected, plan } = this.props;
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
                    className="PlanOptionsSection"
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
                                    <Text
                                        className="col-md-12"
                                        label="Tip Campanie"
                                        name="tip_campanie"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="col-md-7 offset-md-1">{this.renderSelectedOffer()}</div>
                        </div>
                        <FormErrors errors={this.state.errors} />
                        {!isLinkSent && (
                            <div className="spaced-top">
                                <Button outlined value="Continua" onClick={this.handleNextClick} />
                            </div>
                        )}
                    </Form>
                </Section>
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    counties: getCounties(state),
    eeOffers: getOffers(state, 'EE'),
    gazOffers: getOffers(state, 'GAZ'),
    comboOffers: getOffers(state, 'COMBO'),
    session: getSession(state),
    nlc: getNLC(state),
    flow: getFlow(state).toLowerCase(),
    plan: getCurrentPlan(state),
    eeProviders: getProviders(state, 'ee'),
    gazProviders: getProviders(state, 'gaz'),
    isPlanSelected: isPlanSelected(state),
    isLinkSent: isLinkSent(state),
    isFastFlux: isFastFlux(state),
    campaigns: getCampaigns(state),
    discounts: getDiscounts(state),
});

const mapDispatchToProps = {
    fetchOffers,
    fetchCampaigns,
    fetchDiscounts,
    clearOffers,
    clearCampaigns,
    clearDiscounts,
    setCurrentPlan,
    setSessionPlan,
    setSessionOptions,
    setSessionLink,
    patchSession,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlanOptionsSection);
