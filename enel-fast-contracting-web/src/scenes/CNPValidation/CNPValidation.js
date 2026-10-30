import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import * as ocrSelectors from 'store/ocr/selectors';
import { getClient, hasEmail } from 'store/client/selectors';

import {
    checkCNP,
    checkCNPCaptcha,
    markAction,
} from 'store/client/actions';

import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import Form from 'components/validation/form';
import Input from 'components/validation/input';
import Button from 'components/validation/button';
import FormErrors from 'components/FormErrors';
import HeaderHero from 'components/heroes/HeaderHero';
import { required, cnp, cui } from 'components/validation/rules';
import { showLoading, hideLoading } from '../../store/ui/actions';
import { updateRegistrationInfo } from 'store/registration/actions';
import { ReCaptcha } from 'react-recaptcha-google';
import { RECAPTCHA_KEY } from 'utils/config';

import clientService from 'services/client';
import { getSession } from 'store/session/selectors';
import pageService from 'services/page';
import { patch as patchSession } from 'store/session/actions';
import ModalOverlay from 'components/overlays/ModalOverlay';
import './CNPValidation.scss';
import { toRegistrationPostData } from 'utils/serializers';
import { getRegistrationNumber } from 'store/registration/selectors';

const propTypes = {
    ID: PropTypes.object,
    client: PropTypes.object,
    session: PropTypes.object,
    checkCNP: PropTypes.func.isRequired,
    checkCNPCaptcha: PropTypes.func.isRequired,
    patchSession: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    client: {},
    ID: {},
    session: {},
};

class CNPValidation extends Component {

    form = {
        cnp: this.props.ID.id || '',
        cui: '',
        // telefon_mobil: this.getFromSession('telefon_mobil'),
        // email: this.getFromSession('email'),
        code: '',
        pin: '',
    };

    formErrors = {
        cnp: [],
        cui: [],
    };

    state = {
        form: this.form,
        formErrors: this.formErrors,
        step: 1,
        showValidationOverlay: false,
        showPinNotReceivedOverlay: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.markAction(pageService.actions.VALIDARE_CNP.value);
        if (this.recaptcha) {
            this.recaptcha.reset();
        }
    }

    // getFromSession(property) {
    //     if (this.props.session.isBusiness) {
    //         return this.props.session.company && this.props.session.company.data && this.props.session.company.data[property] || '';
    //     } else if (this.props.session.client) {
    //         return this.props.session.client[property] || '';
    //     }
    //
    //     return '';
    // }

    getPinMessage() {
        if (this.props.hasEmail) {
            return 'Având în vedere că ești deja client, este necesară validarea identității tale. Astfel, vei primi prin SMS, pe numărul de telefon înregistrat în baza noastră de date, un cod de validare. Ulterior, datele din sistemul nostru vor fi afișate, iar tu poți să le confirmi sau să le modifici.';
        }

        return 'Având în vedere că ești deja client, este necesară validarea identității tale. Astfel, vei primi prin SMS, pe numărul de telefon înregistrat în baza noastră de date, un cod de validare.';
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleRecaptchaLoad() {
        if (this.recaptcha) {
            this.recaptcha.reset();
        }
    }

    handleRecaptchaToken(token) {
        this.setState({
            form: _.extend(this.state.form, {
                code: token,
            }),
        });
    }

    async handleRecaptchaValidation(e) {
        e.preventDefault();
        const { contract_type ,type} = this.props.session;
        this.resetFormErrors();
        this.form.validateAll();

        this.validateCustomRules();
        if (this.noErrors()) {

            window.dataLayer = window.dataLayer || [];
            const dataLayer = window.dataLayer
            const isStep6Send = dataLayer.find((data) => data.event === 'online_contract' && data.step === 6);

            if(!isStep6Send) {
                window.dataLayer.push({
                    'event': 'online_contract',
                    'step': 6,
                    'client_type': contract_type === "b2c" ? "residential" : "business",
                    'service_type': type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                });
            }
            if (this.state.step == 1) {
                const data = _.pick(this.state.form, ['cnp', 'cui', 'code']);
                const values = {};
                if (contract_type === 'b2b') {
                    values.company = {
                        data: {
                            cui: data.cui,
                        },
                    };
                } else {
                    values.client = {
                        cnp: data.cnp,
                        // email: this.state.form.email.trim(),
                        // telefon_mobil: this.state.form.telefon_mobil.trim(),
                    };
                }

                try {
                    if (contract_type === 'b2b') {
                        await this.props.updateRegistrationInfo(
                            toRegistrationPostData(this.state.form, this.props),
                            this.props.registrationNumber
                        );
                    }
                    this.props.showLoading();
                    await this.props.patchSession(values);
                    const result = await this.props.checkCNPCaptcha(data);

                    this.setState({ step: 2 });
                    this.props.hideLoading();
                } catch (e) {
                    browserHistory.push(pageService.links['client-info-new']);
                }
            } else {
                const data = _.pick(this.state.form, ['cnp', 'cui', 'pin']);
                const values = {};
                if (contract_type === 'b2b') {
                    values.company = {
                        data: {
                            cui: data.cui,
                        },
                    };
                } else {
                    values.client = {
                        cnp: data.cnp,
                        // email: this.state.form.email.trim(),
                        // telefon_mobil: this.state.form.telefon_mobil.trim(),
                    };
                }

                await this.props.patchSession(values);

                if (this.state.form.pin.length == 0) {
                    this.setState({
                        showValidationOverlay: true,
                    });
                } else {
                    try {
                        this.props.showLoading();
                        await this.props.checkCNP(data);
                        pageService.scrollToTop();

                        this.props.hideLoading();
                        if (_.isEmpty(this.props.client)) {
                            browserHistory.push(pageService.links['client-info-new']);
                        } else {
                            browserHistory.push(pageService.links['client-info-found']);
                        }
                    } catch (e) {
                        this.props.hideLoading();
                        browserHistory.push(pageService.links['client-info-new']);
                    }
                }

            }
        } else if (contract_type === 'b2b') {
            // const data = _.pick(this.state.form, ['cui']);
        } else {
            // const data = _.pick(this.state.form, ['cnp']);
        }
    }

    handlePinNotReceived(e) {
        e.preventDefault();
        this.setState({ showPinNotReceivedOverlay: true });
    }

    handleOverlayConfirm(e) {
        e.preventDefault();
        this.props.patchSession({ backoffice: true });
        browserHistory.push(pageService.links['client-info-new']);
    }

    handleOverlayDismiss(e) {
        e.preventDefault();
        this.setState({
            showValidationOverlay: false,
            showPinNotReceivedOverlay: false,
        });
    }

    handleKey(e) {
        if (e.key === 'Enter') {
            this.handleRecaptchaValidation(e);
        }
    }

    noErrors() {

        if (!_.isNil(_.find(this.state.formErrors, section => section.length > 0))) {
            return false;
        }
        return !(this.form.getChildContext()._errors.length > 0);
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) });
    }

    validateCustomRules() {
        const LEGAL_AGE = 18;
        const { formErrors } = this.state;

        if (clientService.getAgeFromCNP(this.state.form.cnp) < LEGAL_AGE) {
            formErrors.cnp.push(
                <span>
                    Pentru a putea încheia contractul de furnizare online trebuie să ai peste 18 ani.<br />Te așteptăm în cel mai apropiat magazin <a
                        href="https://www.ppcenergy.ro/contact"
                        target="_blank"
                        rel="noreferrer"
                    >PPC</a> pentru a continua procesul.
                </span>
            );
        }

        if (!this.state.form.code) {
            formErrors.cnp.push('Trebuie sa bifezi validarea reCAPTCHA.');
        }

        this.setState({
            formErrors,
        });
    }

    renderFormErrors(section) {
        if (this.state.formErrors[section].length > 0) {
            return (
                <FormErrors
                    errors={this.state.formErrors[section]}
                />
            );
        }
    }

    renderContent() {
        const { contract_type } = this.props.session;
        const pinField = this.state.step == 2 ? (
            <div className="row">
                <div className="mb-3 col-md-12 col-lg-12">
                    <p className="disclaimer spaced-bottom-md">
                        {this.getPinMessage()}
                    </p>
                    <label htmlFor="pin">PIN</label>
                    <input
                        type="number"
                        pattern="[0-9]*"
                        className="form-control"
                        name="pin"
                        value={this.state.form.pin}
                        onChange={this.handleInputChange}
                        onKeyPress={this.handleKey}
                    />
                </div>
            </div>
        ) : null;

        const pinNotReceivedBtn = this.state.step == 2 ? (
            <Button type="submit" className="btn btn-outline-secondary col-md-12" style={{ marginBottom: '10px' }} onClick={this.handlePinNotReceived}>
                Nu ai primit PIN?
            </Button>
        ) : null;

        return (
            <div className="hero-container">
                {this.renderFormErrors('cnp')}
                {this.renderFormErrors('cui')}

                {contract_type === 'b2c' &&
                    <div className="row">
                        <Input
                            name="cnp"
                            label="CNP"
                            value={this.state.form.cnp}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleKey}
                            className="form-control"
                            containerClass="mb-3 col-md-12 col-lg-12"
                            validations={[required, cnp]}
                            type="number"
                        />
                    </div>
                }
                {contract_type === 'b2b' &&
                    <div className="row">
                        <Input
                            name="cui"
                            label="CUI"
                            value={this.state.form.cui}
                            onChange={this.handleInputChange}
                            onKeyPress={this.handleKey}
                            className="form-control"
                            containerClass="mb-3 col-md-12 col-lg-12"
                            validations={[required, cui]}
                            type="text"
                        />

                    </div>
                }

                <div className="row recaptcha">
                    <ReCaptcha
                        ref={(el) => {
                            this.recaptcha = el;
                        }}
                        size={window.screen.width < 360 ? 'compact' : 'normal'}
                        data-theme="dark"
                        render="explicit"
                        sitekey={RECAPTCHA_KEY}
                        onloadCallback={this.handleRecaptchaLoad}
                        verifyCallback={this.handleRecaptchaToken}
                    />
                </div>
                {pinField}
                <div className="offset-top text-center">
                    {pinNotReceivedBtn}
                    <Button type="submit" className="btn btn-primary col-md-12" onClick={this.handleRecaptchaValidation}>
                        Continuă
                    </Button>
                </div>
            </div>
        );
    }

    render() {
        const { contract_type } = this.props.session;
        return (
            <div className="CNPValidation">
                <ModalOverlay
                    show={this.state.showValidationOverlay}
                    onClose={this.handleOverlayDismiss}
                >
                    <ConfirmOverlay
                        title="PIN-ul nu a fost introdus"
                        description="Te rugăm să continui procesul online de introducere date și încărcare documente. Ulterior, contractul tău va fi procesat de un operator PPC și vei primi documentele contractuale pentru semnare pe e-mail sau SMS."
                        confirmLabel="Continuă"
                        onConfirm={this.handleOverlayConfirm}
                        dismissLabel="Înapoi"
                        onDismiss={this.handleOverlayDismiss}
                        noLogo
                        noFixed
                        show
                        big
                    />
                </ModalOverlay>

                <ModalOverlay
                    show={this.state.showPinNotReceivedOverlay}
                    onClose={this.handleOverlayDismiss}
                >
                    <ConfirmOverlay
                        title="Continuă fără PIN"
                        description="Te rugăm să continui procesul online de introducere date și încărcare documente. Ulterior, contractul tău va fi procesat de un operator PPC și vei primi documentele contractuale pentru semnare pe e-mail sau SMS."
                        confirmLabel="Continuă"
                        onConfirm={this.handleOverlayConfirm}
                        dismissLabel="Înapoi"
                        onDismiss={this.handleOverlayDismiss}
                        noLogo
                        noFixed
                        show
                        big
                    />
                </ModalOverlay>
                <HeaderHero
                    title={`${contract_type === 'b2b' ? 'Confirmare CUI' : 'Confirmare CNP'}`}
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                <div className="main-content">
                    <div className="page-description">
                        Asigură-te că informațiile sunt corecte și modifică dacă este necesar.
                    </div>
                </div>
                <div className="main-content bottom-margin" >
                    <div className="row">
                        <Form
                            className="single-column"
                            ref={(c) => {
                                this.form = c;
                            }}
                        >
                            <div className="col-md-12">
                                {this.renderContent()}
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}

CNPValidation.propTypes = propTypes;
CNPValidation.defaultProps = defaultProps;

const mapStateToProps = state => ({
    ID: ocrSelectors.getId(state),
    client: getClient(state),
    hasEmail: hasEmail(state),
    session: getSession(state),
    registrationNumber: getRegistrationNumber(state),
});

const mapDispatchToProps = {
    checkCNP,
    checkCNPCaptcha,
    patchSession,
    showLoading,
    hideLoading,
    markAction,
    updateRegistrationInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(CNPValidation);
