import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';

import { getCurrentPlan } from 'store/offers/selectors';
import offerService from 'services/offer';

import Section from 'components/Section';
import OfferCard from 'components/OfferCard';
import PlanDetailsOverlay from 'components/overlays/PlanDetailsOverlay';

import './OfferSection.scss';

class OfferSection extends Component {
    detailsModal = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
        this.state = {
            show_modal: false,
        };
    }

    handleMoreClick() {
        this.setState((state) => ({
            ...state,
            show_modal: !this.state.show_modal,
        }));
    }

    renderType() {
        if (this.props.plan.eeOffer || this.props.plan.gazOffer) {
            const plan = offerService.getPlanDetails(this.props.plan);
            const types = {
                EE: 'Energie electrică',
                GAZ: 'Gaze naturale',
                COMBO: 'Energie electrică și gaze naturale',
            };

            return <h1>Oferta ta de {types[plan.serviciu]}</h1>;
        }
    }

    renderOffer() {
        const { plan } = this.props;
        if (plan.eeOffer || plan.gazOffer) {
            return <OfferCard plan={plan} onMore={this.handleMoreClick} />;
        }
    }

    renderPlanOverlay() {
        const { plan } = this.props;
        if (plan.eeOffer || plan.gazOffer) {
            return (
                <PlanDetailsOverlay
                    ref={this.detailsModal}
                    plan={this.props.plan}
                    showModal={this.state.show_modal}
                    toggleModal={this.handleMoreClick}
                />
            );
        }
    }

    render() {
        return (
            <Fragment>
                {this.renderPlanOverlay()}
                <Section className="OfferSection">
                    <div className="row">
                        <div className="col-md-4">{this.renderType()}</div>
                        <div className="col-md-7 offset-md-1">{this.renderOffer()}</div>
                    </div>
                </Section>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    plan: getCurrentPlan(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(OfferSection);
