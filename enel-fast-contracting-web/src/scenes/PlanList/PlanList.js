import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';
import { toRegistrationPostData } from 'utils/serializers';
import strings from 'services/strings';
import offerService from 'services/offer';
import pageService from 'services/page';

import * as offersSelectors from 'store/offers/selectors';
import { getSession } from 'store/session/selectors';
import { getRegistrationNumber } from 'store/registration/selectors';
import { setPlan as setSessionPlan } from 'store/session/actions';
import { setCurrentPlan } from 'store/offers/actions';
import { markAction } from 'store/client/actions';
import HeaderHero from 'components/heroes/HeaderHero';
import { updateRegistrationInfo } from 'store/registration/actions';
import './PlanList.scss';

const LABELS = {
    pret_ea_n: 'Preț energie',
    pret_eaz_n: 'Preț energie - zi',
    pret_eano_n: 'Preț energie - noapte',
    pret_eanw_n: 'Preț energie - noapte și weekend',
    abonament_n_ee: 'Abonament energie',

    pret_gaz_n: 'Preț gaz',
    pret_tr_gaz_n: 'Transport Gaz',
    abonament_n_gaz: 'Abonament gaz',

    abonament_n: 'Abonament',
};

const propTypes = {
    eeOffers: PropTypes.object,
    gazOffers: PropTypes.object,
    comboOffers: PropTypes.object,
    session: PropTypes.object,
    setSessionPlan: PropTypes.func.isRequired,
    setCurrentPlan: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    eeOffers: {},
    gazOffers: {},
    comboOffers: {},
    session: {},
};

class PlanList extends Component {

    state = {
        show: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {

        this.props.markAction(pageService.actions.SELECTARE_OFERTA.value);
        document.body.className = 'bg-grey lista-servicii-oferte-3';

        setTimeout(() => {
            this.setState({ show: true });
        }, 300);
        const annualConsumption = this.props.session.ee_consum ? (this.props.session.ee_consum.length > 0 ? (this.props.session.ee_consum[0].anual) : (this.props.session.gaz_consum.length > 0 ? this.props.session.gaz_consum[0].anual : (this.props.session.ee_loc.cantitate_anuala ? this.props.session.ee_loc.cantitate_anuala : (this.props.session.gaz_loc.cantitate_anuala ? this.props.session.gaz_loc.cantitate_anuala : '')))) : (this.props.session.ee_loc && this.props.session.ee_loc.cantitate_anuala ? this.props.session.ee_loc.cantitate_anuala : '');
        const offer = {
            // offerCategory: plan[0].cod, // commodities or solutions
            offerCategory: 'n.a.', // commodities or solutions
            // offerName: plan[0].denumire, // enel fixed annual || fix online || enel gaz
            offerName: 'n.a.', // enel fixed annual || fix online || enel gaz
            offerType: this.props.session.type.toLowerCase() !== 'ee' ? 'natural gas' : 'electricity',
            offerUsage: this.props.session.contract_type === 'b2b' ? 'business' : 'residential', // business or
            offerCounty: this.props.session.judet, //
            annualConsumption,
        };
    }

    componentWillUnmount() {
        document.body.className = '';
    }

    countPrices(plan) {
        plan = offerService.getPlanDetails(plan);
        let prices = 0;

        _.each(LABELS, (label, key) => {
            if (plan[key]) {
                prices++;
            }
        });

        return prices;
    }

    async handlePlanSelect(plan) {
        await this.props.setCurrentPlan(plan);
        await this.props.setSessionPlan(plan);

        const {session} = this.props

        if(plan.length > 0) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'online_contract',
                'step': 2,
                service_pack: plan[0].denumire || "",
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });
        }


        pageService.scrollToTop();
        if (this.props.location.state && this.props.location.state.fromNLCValidation) {
            await this.props.updateRegistrationInfo(
                toRegistrationPostData({
                    cod_oferta: plan[0].cod,
                }, this.props),
                this.props.registrationNumber
            );
            browserHistory.push(pageService.links['client-place-info']);
        } else {
            browserHistory.push(pageService.links['agreement']);
        }
    }


    renderPrices(plan) {
        plan = offerService.getPlanDetails(plan);
        const prices = {};

        _.each(LABELS, (label, key) => {
            if (plan[key]) {
                prices[key] = {
                    value: plan[key],
                    label,
                };
            }
        });

        return _.map(prices, (price, key) => (
            <div className="oferta-div" key={_.uniqueId()}>
                <div className="price-wrapper">
                    <span>{price.label}</span>
                    <strong>{strings.formatPrice(price.value, key)}</strong>
                    <span>{key.match('abonament') ? 'lei/zi' : 'lei/kWh'}</span>
                </div>
            </div>
        ));
    }

    renderType(plan) {
        plan = offerService.getPlanDetails(plan);
        const types = {
            EE: 'Energie electrică',
            GAZ: 'Gaze naturale',
            COMBO: 'Energie electrică și gaze naturale',
        };

        return <span className="eyebrow georgia">{types[plan.serviciu]}</span>;
    }

    renderTitle(plan) {

        // const toPascalCase = (title) => {
        //     return title.toLowerCase().split(' ')
        //         .map(word => {
        //             const wordAsArray = word.split('')
        //             wordAsArray[0] = wordAsArray[0].toUpperCase()
        //             return wordAsArray.join('')
        //         })
        //         .join(' ').trim()
        // }
        plan = offerService.getPlanDetails(plan);

        if (plan.serviciu == 'COMBO') {
            return <h4 className="card-title">{plan.denumire_pachet}</h4>;
        }

        return <h4 className="card-title">{plan.denumire}</h4>;
    }

    renderDescription(plan) {
        plan = offerService.getPlanDetails(plan);

        if (plan.serviciu == 'COMBO') {
            return <p className="card-text">{plan.descriere_pachet}</p>;
        }

        return <p className="card-text">{plan.descriere_prod}</p>;
    }

    renderPlan(plan) {
        const { hasOfferParams } = this.props;
        return (
            <div
                className={`card card-serv cards-${this.countPrices(plan)}`}
                key={_.uniqueId()}
            >
                {/* <div className="card-header">{this.renderPrices(plan)}</div> */}
                <div className="card-body">
                    {this.renderType(plan)}
                    {this.renderTitle(plan)}
                    {/* {this.renderDescription(plan)} */}
                    <div className="spaced-top">
                        <button
                            type="submit"
                            className="btn btn-full-mobile btn-outline-secondary col-12"
                            onClick={() => this.handlePlanSelect(plan)}
                        >
                            {hasOfferParams ? 'Continuă' : 'Alege oferta'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    renderCounty() {
        if (this.props.session.judet) {
            const county = strings.capitalize(this.props.session.judet);

            if (county == 'Bucuresti') {
                return `municipiul ${county}`;
            }

            return `judeţul ${county}`;
        }
    }

    renderPlans() {
        const { offerParams, hasOfferParams } = this.props;

        if (this.props.location.state && this.props.location.state.denumire && this.props.location.state.tip) {
            // if (hasOfferParams) {
            let { denumire, tip } = offerParams;
            denumire = this.props.location.state.denumire;
            tip = this.props.location.state.tip;

            const offers = this.props[`${tip.toLowerCase()}Offers`];
            if (!_.isEmpty(offers)) {
                const isCombo = tip.toLowerCase() == 'combo';
                const offer = isCombo ? _.find(offers, item => item[0] && item[0].denumire_pachet.toLowerCase().replace(/[^A-Z0-9]+/ig, '') == denumire.toLowerCase().replace(/[^A-Z0-9]+/ig, '')) :
                    _.find(offers, item => item.denumire.toLowerCase().replace(/[^A-Z0-9]+/ig, '') == denumire.toLowerCase().replace(/[^A-Z0-9]+/ig, ''));

                if (offer) {
                    if (isCombo) {
                        return (
                            <div className="card-set set-combo">
                                {this.renderPlan(offer)}
                            </div>
                        );
                    } else if (tip == 'ee') {
                        return (
                            <div className="card-set set-electricitate">
                                {this.renderPlan([offer])}
                            </div>
                        );
                    } else if (tip == 'gaz') {
                        return (
                            <div className="card-set set-gaz">
                                {this.renderPlan([offer])}
                            </div>
                        );
                    }
                }
            }
        }

        return (
            <Fragment>
                <div className="card-set set-electricitate">
                    {_.map(this.props.eeOffers, offer =>
                        this.renderPlan([offer])
                    )}
                </div>
                <div className="card-set set-gaz">
                    {_.map(this.props.gazOffers, offer =>
                        this.renderPlan([offer])
                    )}
                </div>
                <div className="card-set set-combo">
                    {_.map(this.props.comboOffers, offers =>
                        this.renderPlan(offers)
                    )}
                </div>
            </Fragment>
        );
    }

    render() {
        const { hasOfferParams } = this.props;
        return (
            <Fragment>
                <div className={`PlanList ${this.state.show ? 'show' : ''}`}>
                    {this.props.location.state && this.props.location.state.fromNLCValidation ? (<HeaderHero title="Consultă ofertele pentru județul tău" />) : (<HeaderHero title={hasOfferParams ? 'Consultă oferta pentru județul tău' : 'Alege oferta'} />)}
                    <div className="main-content" style={{ maxWidth: 'unset' }}>
                        {((parseInt(this.props.location.state.consum_anual) > 50000 && this.props.session.contract_type === 'b2b' && this.props.session.type.toLowerCase() === 'ee') || (parseInt(this.props.location.state.consum_anual) > 280000 && this.props.session.contract_type === 'b2b' && this.props.session.type.toLowerCase() === 'gaz')) ? (<div>
                            <p className="text-size">Ne pare rău. În acest moment nu există oferte disponibile caracteristice profilului tău. Te rugăm să iei legătura cu un reprezentant PPC, accesând pagina <a href="https://www.ppcenergy.ro/business">aceasta</a>.</p>
                        </div>) : (<div>
                            {this.props.location.state && this.props.location.state.fromNLCValidation &&
                                <div className="row">
                                    <p>Conform detaliilor pe care ni le-ai furnizat, nu ești eligibil pentru oferta pe care ai
                                        început procesul de contractare online.
                                        Te rugăm să alegi un alt produs care îți este dedicat din ofertele următoare. Vei
                                        continua procesul fără să fie nevoie să reiei pașii deja parcurși.</p></div>
                            }
                            <div className="row">
                                <div className="col-md-4">
                                    {this.props.location.state && this.props.location.state.fromNLCValidation ? (<h1>Nu ești eligibil pentru acest produs. Alege una dintre ofertele pentru tine din {this.renderCounty()}.</h1>) : (<h1 className="header">
                                        {hasOfferParams ? 'Oferta ta' : 'Ofertele tale'} pentru {this.renderCounty()}.
                                    </h1>)}
                                </div>
                                <div className="col-md-5 offset-md-1 card-set-wrapper transition-3s">
                                    {this.renderPlans()}
                                </div>
                            </div>
                        </div>)}
                    </div>
                </div>
            </Fragment>
        );
    }
}

PlanList.propTypes = propTypes;
PlanList.defaultProps = defaultProps;

const mapStateToProps = state => ({
    eeOffers: offersSelectors.getItems(state, 'EE'),
    gazOffers: offersSelectors.getItems(state, 'GAZ'),
    comboOffers: offersSelectors.getItems(state, 'COMBO'),
    offerParams: offersSelectors.getParams(state),
    hasOfferParams: offersSelectors.hasParams(state),
    session: getSession(state),
    registrationNumber: getRegistrationNumber(state),
});

const mapDispatchToProps = {
    setSessionPlan,
    setCurrentPlan,
    markAction,
    updateRegistrationInfo,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlanList);
