import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './OfferCard.scss';
import _ from 'lodash';

import strings from 'services/strings';
import offerService from 'services/offer';

import Button from 'components/Button';

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

class OfferCard extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
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
            <div
                className={`oferta-div ${plan.serviciu.toLowerCase()}`}
                key={_.uniqueId()}
            >
                <div className="price-wrapper">
                    <span>{price.label}</span>
                    <strong>{strings.formatPrice(price.value, key)}</strong>
                    <span>{key.match('abonament') ? 'lei/zi' : 'lei/kWh'}</span>
                </div>
            </div>
        ));
    }

    renderType() {
        const plan = offerService.getPlanDetails(this.props.plan);
        const types = {
            EE: 'Energie electrică',
            GAZ: 'Gaze naturale',
            COMBO: 'Energie electrică și Gaze naturale',
        };

        return <span className="eyebrow georgia">{types[plan.serviciu]}</span>;
    }

    renderTitle() {
        const plan = offerService.getPlanDetails(this.props.plan);
        if (plan.serviciu === 'COMBO') {
            return <h4 className="card-title">{plan.denumire_pachet}</h4>;
        }

        return <h4 className="card-title">{plan.denumire}</h4>;
    }

    renderDescription() {
        const plan = offerService.getPlanDetails(this.props.plan);
        if (plan.serviciu === 'COMBO') {
            return <p className="card-text">{plan.descriere_pachet}</p>;
        }

        return <p className="card-text">{plan.descriere_prod}</p>;
    }

    render() {
        return (
            <div className="OfferCard">
                <div className={`card card-serv cards-${this.countPrices()}`}>
                    <div className="card-header">{this.renderPrices()}</div>
                    <div className="card-body">
                        {this.renderType()}
                        {this.renderTitle()}
                        {this.renderDescription()}
                        <div className="btn-wrapper">
                            <Button
                                secondary
                                outline
                                value="Mai multe detalii"
                                onClick={this.props.onMore}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default OfferCard;
