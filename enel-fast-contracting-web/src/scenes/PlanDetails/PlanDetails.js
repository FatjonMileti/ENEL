import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import strings from 'services/strings';
import offerService from 'services/offer';

import * as offersSelectors from 'store/offers/selectors';
import { setPlan as setSessionPlan } from 'store/session/actions';

import pageService from 'services/page';

import './PlanDetails.scss';

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
    plan: PropTypes.object,
    setSessionPlan: PropTypes.func.isRequired,
};

const defaultProps = {
    plan: {},
};

class PlanDetails extends Component {

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        document.body.className = 'bg-gray page-oferta-31e';
    }

    componentWillUnmount() {
        document.body.className = '';
    }

    countPrices() {
        const plan = offerService.getPlanDetails(this.props.plan);
        let prices = 0;

        _.each(LABELS, (label, key) => {
            if (plan[key]) {
                prices++;
            }
        });

        return prices;
    }

    async handlePlanSelect() {
        await this.props.setSessionPlan(this.props.plan);
        pageService.scrollToTop();
        browserHistory.push(pageService.links['agreement']);
    }

    renderType() {
        const plan = offerService.getPlanDetails(this.props.plan);
        const types = {
            EE: 'Oferte energie electrică',
            GAZ: 'Oferte gaze naturale',
            COMBO: 'Oferte energie electrică și gaze naturale',
        };

        return (
            <p className="eyebrow georgia">{types[plan.serviciu]}</p>
        );
    }

    renderTitle() {
        const plan = offerService.getPlanDetails(this.props.plan);

        if (plan.serviciu == 'COMBO') {
            return <h1 className="superheader">{plan.denumire_pachet}</h1>;
        }

        return <h1 className="superheader">{plan.denumire}</h1>;
    }

    renderPrices() {
        const plan = offerService.getPlanDetails(this.props.plan);
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
                <span className="eyebrow georgia">{price.label}</span>
                <strong>{strings.formatPrice(price.value, key)}</strong>
                <span className="unit">{key.match('abonament') ? 'lei/zi' : 'lei/kWh'}</span>
            </div>
        ));
    }

    renderLongDescription() {
        const plan = offerService.getPlanDetails(this.props.plan);

        if (plan.serviciu == 'COMBO') {
            return (
                <div
                    className="spaced-bottom-lg"
                    dangerouslySetInnerHTML={{ __html: plan.descriere_pachet_l || plan.descriere_pachet }}
                />
            );
        }

        return (
            <div
                className="spaced-bottom-lg"
                dangerouslySetInnerHTML={{ __html: plan.descriere_prod_l || plan.descriere_prod }}
            />
        );
    }

    renderContent() {
        const { hasOfferParams, isPlanSelected } = this.props;
        if (isPlanSelected) {
            return (
                <Fragment>
                    <header className="container top-header header--immersive product--blue">
                        <div className="row title-bar">
                            <div className="col-md-12 center">
                                {this.renderType()}
                                {this.renderTitle()}
                            </div>
                        </div>
                    </header>
                    <div className="container container--wide plan-overview main-area area--boxed area--hero">
                        <div className={`card-header plan-horizontal cards-${this.countPrices()}`}>
                            {this.renderPrices()}
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-lg-12">
                                    {this.renderLongDescription()}
                                    <div className="text-center">
                                        <button type="submit" className="btn btn-primary btn-full-mobile" onClick={this.handlePlanSelect}>{hasOfferParams ? 'Continuă' : 'Alege oferta'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Fragment>
            );
        }
    }

    render() {
        return (
            <div className="PlanDetails">
                {this.renderContent()}
            </div>
        );
    }
}

PlanDetails.propTypes = propTypes;
PlanDetails.defaultProps = defaultProps;

const mapStateToProps = state => ({
    plan: offersSelectors.getCurrentPlan(state),
    isPlanSelected: offersSelectors.isPlanSelected(state),
    hasOfferParams: offersSelectors.hasParams(state),
});

const mapDispatchToProps = {
    setSessionPlan,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlanDetails);
