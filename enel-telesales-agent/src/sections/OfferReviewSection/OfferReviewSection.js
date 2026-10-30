import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { browserHistory } from 'react-router';
import { getSession, hasDocsCompleted, isContractSent } from 'store/session/selectors';
import { getOffer, getOfferCity } from 'store/offer/selectors';
import { getLink } from 'store/client/selectors';

import Section from 'components/Section';
import { Button } from 'components/Button';

import './OfferReviewSection.scss';
import { Text as TextInput } from 'informed';
import api from 'services/api';

class OfferReviewSection extends Component {
    state = {
        email: null,
        telefon: null,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    validatePhonenumber(inputtxt) {
        if (inputtxt) {
            var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
            if (inputtxt.match(phoneno)) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    async sendOfferToClient() {
        if (!this.props.city || this.props.offer.length === 0) {
            alert('Vă rugăm să completați câmpurile din pasul 1!');
            return;
        }
        if (
            this.state.email !== '' &&
            this.state.email !== null &&
            !this.validateEmail(this.state.email)
        ) {
            alert('Introduceți o adresă de e-mail validă!');
            return;
        }

        if (
            this.state.telefon !== '' &&
            this.state.telefon !== null &&
            !this.validatePhonenumber(this.state.telefon)
        ) {
            alert('Ar trebui să introduceți un număr de telefon valid!');
            return;
        }
        if (this.state.email === '' && this.state.telefon === '') {
            alert('Ar trebui să introduceți cel puțin o informație despre client!');
            return;
        }
        const { offer, city } = this.props;
        const email = this.state.email ? this.state.email : '';
        const result = await api.sendOffer('/offer-service', {
            email,
            city,
            offer: offer[0].cod,
            telefon: this.state.telefon,
        });
        if (result) {
            alert('Oferta trimisa cu succes!');
            this.setState(state => ({ ...state, telefon: null, email: null }));
            browserHistory.push('/sessions');
        }
    }

    setClientFields(name, value) {
        this.setState(state => ({
            ...state,
            [name]: value,
        }));
    }

    render() {
        const { step, isCurrent, show } = this.props;
        return (
            <Section
                title="Detalii Client"
                className="OfferReviewSection"
                step={step}
                isCurrent={isCurrent}
                show={show}
            >
                <label>E-mail</label>
                <TextInput
                    field="Email"
                    type="email"
                    onChange={e => this.setClientFields('email', e.target.value)}
                    className="Text"
                />

                <label>Telefon</label>
                <input
                    type="text"
                    onChange={e => this.setClientFields('telefon', e.target.value)}
                ></input>
                <br></br>
                <br></br>

                <Button primary value="Trimite oferta" onClick={this.sendOfferToClient} />
            </Section>
        );
    }
}

const mapStateToProps = state => ({
    session: getSession(state),
    offer: getOffer(state),
    city: getOfferCity(state),
    link: getLink(state),
    isContractSent: isContractSent(state),
    hasDocsCompleted: hasDocsCompleted(state),
});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OfferReviewSection);
