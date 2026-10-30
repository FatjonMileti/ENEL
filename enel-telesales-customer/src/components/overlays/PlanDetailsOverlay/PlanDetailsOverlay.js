import React, { Component } from 'react';
import autoBind from 'react-autobind';
import _ from 'lodash';
import strings from 'services/strings';
import offerService from 'services/offer';
import Button from 'components/Button';
import Modal from 'components/Modal';
import './PlanDetailsOverlay.scss';

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

class PlanDetailsOverlay extends Component {
    modal = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            show_modal: false,
        };
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

    renderType() {
        const plan = offerService.getPlanDetails(this.props.plan);
        const types = {
            EE: 'Oferte energie electrică',
            GAZ: 'Oferte gaze naturale',
            COMBO: 'Oferte energie electrică și gaze naturale',
        };

        return <p className="eyebrow georgia spaced-bottom-xs">{types[plan.serviciu]}</p>;
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
                    dangerouslySetInnerHTML={{
                        __html: plan.descriere_pachet_l || plan.descriere_pachet,
                    }}
                />
            );
        }

        return (
            <div
                className="spaced-bottom-lg"
                dangerouslySetInnerHTML={{
                    __html: plan.descriere_prod_l || plan.descriere_prod,
                }}
            />
        );
    }

    render() {
        const { className, showModal, toggleModal } = this.props;
        const plan = offerService.getPlanDetails(this.props.plan);
        return (
            <Modal toggleModal={toggleModal} showModal={showModal} className={className}>
                <header className="container top-header" style={
                    plan.serviciu === 'GAZ'
                        ? { backgroundColor: '#FF6447' }
                        : { backgroundColor: '#4285f4' }

                }>
                    <div className="row title-bar">
                        <div className="col-md-12 center">
                            {this.renderType()}
                            {this.renderTitle()}
                        </div>
                    </div>
                </header>
                <i className="ion-md-close close-btn" onClick={toggleModal} />
                <div className="container container--wide plan-overview main-area area--boxed area--hero">
                    <div className={`card-header plan-horizontal cards-${this.countPrices()}`}>
                        {this.renderPrices()}
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-lg-12">
                                {this.renderLongDescription()}
                                <div className="text-center">
                                    <Button primary value="Inchide" onClick={toggleModal} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default PlanDetailsOverlay;
