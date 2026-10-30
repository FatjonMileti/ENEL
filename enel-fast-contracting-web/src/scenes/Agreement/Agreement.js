import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import SignatureCanvas from 'components/signature';
import _ from 'lodash';
import $ from 'jquery';


import { getSession } from 'store/session/selectors';
import { getRedirect } from 'store/ui/selectors';
import { getFlow, getClient } from 'store/client/selectors';
import { getRegistrationPageURL, getRegistrationNumber } from 'store/registration/selectors';

import * as sessionActions from 'store/session/actions';
import { uploadSignature } from 'store/documents/actions';
import { unsetRedirect, showLoading, hideLoading } from 'store/ui/actions';
import { markAction } from 'store/client/actions';
import { createRegistrationNumber, sendRegistrationEmail } from 'store/registration/actions';

import Form from 'components/validation/form';
import Button from 'components/validation/button';
import { required, matchEmail } from 'components/validation/rules';

import pageService from 'services/page';

import AgreementOverlay from './AgreementOverlay';
import UserForm from './UserForm';
import CompanyForm from './CompanyForm';
import HeaderHero from 'components/heroes/HeaderHero';

import './Agreement.scss';

import { toRegistrationPostData, toRegistrationEmailData } from 'utils/serializers';
import { REGISTRATION_EMAIL_TYPES } from 'utils/constants/app';

import Signature from './Signature';
import { toPatchSessionData } from './serializers';

const propTypes = {
    session: PropTypes.object,
    client: PropTypes.object,
    patchSession: PropTypes.func.isRequired,
    uploadSignature: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    session: {},
    client: {},
};

class Agreement extends Component {

    form = {
        firstName: this.props.session.prenume || '',
        lastName: this.props.session.nume || '',
        clientEmail: this.props.session.clientEmail || '',
        clientPhoneNumber: this.props.session.clientPhoneNumber || '',
        confirmEmail: this.props.session.confirmEmail || '',
        companyName: this.props.session && this.props.session.company && this.props.session.company.data && this.props.session.company.data.nume || '',
        companyTelefon: this.props.session && this.props.session.company && this.props.session.company.data && this.props.session.company.data.telefon_mobil || '',
        companyEmail: this.props.session && this.props.session.company && this.props.session.company.data && this.props.session.company.data.email || '',
        companyRepresentativeName: this.props.session && this.props.session.company && this.props.session.company.legal_representative && this.props.session.company.legal_representative.prenume || '',
        companyRepresentativeLastame: this.props.session && this.props.session.company && this.props.session.company.legal_representative && this.props.session.company.legal_representative.nume || '',
    };

    state = {
        loading: true,
        form: this.form,
        signatureError: false,
        signatureOn: false,
        signed: false,
        showAgreementOverlay: false,
        serverError: false,
        serverMessage:""
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.markAction(pageService.actions.ACORD_FURNIZARE_DATE.value);

        if (window.gtag) {
            window.gtag('event', 'conversion', { send_to: 'AW-798358458/_13yCICJnPMBELr31_wC' });
        }

        if (window.fbq) {
            window.fbq('track', 'SubmitApplication');
        }

        setTimeout(() => {
            this.setState({ loading: false },
                () => {
                    $('.signature').attr('width', $('.signature').parent().width());
                    $('.signature').attr('height', $('.signature').parent().height());
                    this.signaturePad.clearTransparent();
                });
        }, 1000);
    }

    resetState() {
        this.setState({
            form: this.form,
        });
    }

    handleClearClick(e) {
        e.preventDefault();
        this.signaturePad.clearTransparent();
        if (!this.state.signatureOn) {
            this.setState({
                signed: false,
                signatureOn: false,
            });
        }
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });

        if(["clientPhoneNumber","confirmEmail"].includes(e.target.name)){
            this.setState({serverError: false, serverMessage: ""})
        }
    }

    removeSignatureError(e) {
        this.setState({ signatureError: false });
    }

    async handleNextClick(e) {
        e.preventDefault();
        this.props.showLoading();
        const { redirectTo } = this.props;
        this.form.validateAll();

        if (this.signaturePad.isEmpty()) {
            this.setState({ signatureError: true });
            pageService.scrollToError();
            this.props.hideLoading();
            return;
        }

        if (this.noErrors()) {
            const clientEmail = this.state.form.clientEmail.trim();
            const companyEmail = this.state.form.companyEmail.trim();
            try {
                if (!this.props.registrationNumber) {
                    await this.props.createRegistrationNumber(
                        toRegistrationPostData({
                            ...this.state.form,
                            registrationPageURL: this.props.registrationPageURL,
                        }, this.props)
                    );

                } else if (this.props.session.client && this.props.session.client.email !== clientEmail && this.props.session.contract_type !== 'b2b') {
                    await this.props.sendRegistrationEmail(
                        toRegistrationEmailData(
                            { email: clientEmail },
                            this.props.registrationNumber,
                            REGISTRATION_EMAIL_TYPES.CREATE));

                } else if (this.props.session.company && this.props.session.company.data && this.props.session.company.data.email !== companyEmail && this.props.session.contract_type === 'b2b') {
                    await this.props.sendRegistrationEmail(
                        toRegistrationEmailData(
                            { email: companyEmail },
                            this.props.registrationNumber,
                            REGISTRATION_EMAIL_TYPES.CREATE));
                }

                await this.props.patchSession(toPatchSessionData(this.state.form));

                this.props.uploadSignature(
                    this.signaturePad.toDataURL()
                );
                pageService.scrollToTop();
                this.props.hideLoading();
                const {session} = this.props
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event' : 'online_contract',
                    'step': 3,
                    'client_type': session.contract_type === "b2c" ? "residential" : "business",
                    'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                });

                if (redirectTo) {
                    this.props.unsetRedirect();
                    browserHistory.push(redirectTo);
                } else {
                    browserHistory.push(pageService.links['service-info']);
                }
            } catch(error){
                this.props.hideLoading();
                this.setState({ serverError: true, serverMessage: error.message || "Server error"})
            }
        } else {
            this.props.hideLoading();
            pageService.scrollToError();
        }
    }

    handleDisagree(e) {
        e.preventDefault();
        browserHistory.push('/');
    }

    handleSignClick(e) {
        e.preventDefault();
        pageService.scrollTo(document.getElementById('signature'), { minDuration: 400 });

        this.setState({
            signed: true,
            signatureOn: true,
        });
    }

    handleSaveClick(e) {
        e.preventDefault();
        this.setState({ signatureOn: false });
    }

    noErrors() {
        return !(this.form.getChildContext()._errors.length > 0);
    }

    showAgreementOverlay(e) {
        e.preventDefault();
        this.setState({
            showAgreementOverlay: true,
        });
    }

    handleOverlayDismiss(e) {
        e.preventDefault();
        this.setState({
            showAgreementOverlay: false,
        });
    }

    setSignaturePad(signaturePad) {
        this.signaturePad = signaturePad;
    }

    render() {
        const signatureError = this.state.signatureError ? (
            <div className="invalid-feedback shown">
                <span>Este necesară semnătura în acest câmp.</span>
            </div>
        ) : null;

        const blackListError = this.state.serverError ? (
            <div className="offset-top col-md-12">
                <span style={{color:"red"}}>{this.state.serverMessage}</span>
            </div>
        ) : null;
        return (
            <div className="Agreement">
                <AgreementOverlay
                    show={this.state.showAgreementOverlay}
                    onClose={this.handleOverlayDismiss}
                    onConfirm={this.handleOverlayDismiss}
                />
                <HeaderHero
                    title="Acord preluare și procesare date"
                />
                <div className="page-description" style={{ justifyContent: 'start', display: 'grid' }}>
                    <div className="main-content">
                        Pentru a putea continua, avem nevoie de acordul tău pentru prelucrarea datelor cu caracter
                        personal (semnătura, nume, prenume, adreasă, datele de identificare regăsite în actul de
                        identitate, serie și număr carte de identitate, cod numeric personal). Mai multe detalii despre
                        prelucrarea datelor și procesarea documentelor găsești <a
                            className="description-link"
                            href="#info"
                            onClick={this.showAgreementOverlay}
                        >aici</a>.
                    </div>
                    <div className="main-content">
                        <a
                            className="description-link"
                            target="_blank"
                            href="https://www.ppcenergy.ro/wp-content/uploads/termeni-conditii-contractare-distanta.pdf"
                            rel="noreferrer"
                        >Termeni
                            și condiții pentru vânzare la distanță |</a>
                        <a
                            className="description-link"
                            target="_blank"
                            href="https://www.ppcenergy.ro/wp-content/uploads/conditii-generale-piata-concurentiala-rezidential-ppce.pdf"
                            rel="noreferrer"
                        > Condiții
                            generale de furnizare</a>
                    </div>
                </div>
                <div className="main-content bottom-margin" >
                    <div className="row">
                        <Form
                            className="needs-validation"
                            noValidate
                            role="form"
                            ref={(c) => {
                                this.form = c;
                            }}
                        >
                            <div className="order-md-1 col-md-12">
                                <div className="row">
                                    {this.props.session.contract_type === 'b2b' ? (
                                        <CompanyForm
                                            form={this.state.form}
                                            handleInputChange={this.handleInputChange}
                                            confirmEmailValidations={[required, value => matchEmail(this.state.form.companyEmail, value)]}
                                        />
                                    ) : (
                                        <UserForm
                                            form={this.state.form}
                                            handleInputChange={this.handleInputChange}
                                            confirmEmailValidations={[required, value => matchEmail(this.state.form.clientEmail, value)]}
                                        />
                                    )}
                                </div>
                                <div className='row'>
                                    <div className='row' style={{ margin: 0 }}>
                                        <div className="form-group mb-6 col-md-12">
                                            <label htmlFor="signature">Semnați în acest chenar</label>
                                            <div className="canvas-container">
                                                <Signature
                                                    loading={this.state.loading}
                                                    removeSignatureError={this.removeSignatureError}
                                                    pageService={pageService}
                                                    signed={this.state.signed}
                                                    handleClearClick={this.handleClearClick}
                                                    handleSignClick={this.handleSignClick}
                                                    signatureOn={this.state.signatureOn}
                                                    handleSaveClick={this.handleSaveClick}
                                                    setSignaturePad={this.setSignaturePad}
                                                />
                                            </div>
                                            {signatureError}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='row' style={{ margin: 0 }}>
                                {blackListError}
                                <div className="text-center offset-top col-md-12">
                                    <Button type="submit" className="btn btn-primary col-md-12" onClick={this.handleNextClick}>
                                        Sunt de acord
                                    </Button>
                                </div>
                                <div className="text-center offset-top col-md-12">
                                    <Button
                                        type="submit"
                                        className="btn btn-outline-primary col-md-12"
                                        onClick={this.handleDisagree}
                                    >
                                        Nu sunt de acord
                                    </Button>
                                </div>
                            </div>

                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

Agreement.propTypes = propTypes;
Agreement.defaultProps = defaultProps;

const mapStateToProps = state => ({
    session: getSession(state),
    client: getClient(state),
    redirectTo: getRedirect(state),
    flow: getFlow(state),
    registrationPageURL: getRegistrationPageURL(state),
    registrationNumber: getRegistrationNumber(state),
});

const mapDispatchToProps = {
    patchSession: sessionActions.patch,
    uploadSignature,
    unsetRedirect,
    markAction,
    createRegistrationNumber,
    sendRegistrationEmail,
    hideLoading,
    showLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(Agreement);
