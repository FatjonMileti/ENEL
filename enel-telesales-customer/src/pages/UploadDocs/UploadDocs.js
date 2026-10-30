import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

import HeaderHero from 'components/heroes/HeaderHero';
import FormErrors from 'components/FormErrors';
import Button from 'components/Button';
import Loader from 'components/Loader';
import Section from 'components/Section';
import OfferSection from 'sections/OfferSection';
import SignatureSection from 'sections/SignatureSection';
import UploadDocsSection from 'sections/UploadDocsSection';
import ModalOverlay from 'components/overlays/ModalOverlay';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';

import GeneratedDocList from 'components/docs/GeneratedDocList';

import { fetchGeneratedDocs } from 'store/documents/actions';
import { patch as patchSession } from 'store/session/actions';
import { getSession } from 'store/session/selectors';
import { getSignature, getID, getDocs } from 'store/documents/selectors';
import { isDocLoading } from 'store/ui/selectors';

import './UploadDocs.scss';

const propTypes = {};
const defaultProps = {};

class UploadDocs extends Component {
    formErrors = {
        agreement: [],
        docs: [],
    };

    state = {
        title: 'Datele tale de identificare',
        options: {},
        step: 0,
        picture: '',
        showAgreementOverlay: false,
        showUploadOverlay: false,
        formErrors: this.formErrors,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.session.id && this.props.session.id) {
            this.checkRedirect();
        }
    }

    getAgreementContent() {
        // const { session } = this.props;
        return (
            <Fragment>
                {/*{(!session.contract_type || session.contract_type === 'b2c') && (*/}
                    <div>
                        Pentru a putea continua, avem nevoie de acordul dumneavoastră pentru
                        prelucrarea datelor cu caracter personal (semnătură, nume, prenume, adresă,
                        datele de identificare regăsite în actul de identitate, serie și număr carte
                        de identitate, cod numeric personal), precum și pentru procesarea
                        documentelor necesare (actul de identitate, factura de furnizare, respectiv
                        dovada dreptului de proprietate și/sau de folosință a spațiului).
                        <br />
                        <br />
                        În acest sens, menționăm că atât datele dumneavoastră cu caracter personal
                        cât și documentele dumneavoastră vor fi prelucrate prin intermediul unui
                        sistem de citire automată a informațiilor ca urmare a fotografierii
                        documentelor necesare pentru încheierea contractului de furnizare.
                        <br />
                        <br />
                        Informațiile din cadrul documentelor vor fi utilizate exclusiv în scopul
                        încheierii și derulării relației contractuale, semnătura dumneavoastră
                        captată prin prezentul acord urmând să fie utilizată și în cadrul procesului
                        de schimbare furnizor, în scopul semnării notificării de schimbare furnizor,
                        cât și în vederea încheierii contractului.
                        <br />
                        <br />
                        * Ulterior semnării acestui acord și finalizării procesului de negociere a
                        termenilor contractuali, veți primi un e-mail/SMS de confirmare la adresa
                        indicată de dumneavoastră, ce va conține un link în care veți regăsi toate
                        documentele ce vă vor fi prezentate în continuare.
                        <br />
                        <br />
                        Contractul va fi considerat încheiat și activat doar după accesarea linkului
                        primit și reconfirmarea conținutului documentelor prezentate în continuare.
                        În cazul în care, procesul de încheiere și activarea a contractului nu este
                        finalizat în termen de 90 de zile de la data primirii e-mail-ului/SMS-ului,
                        documentele vor fi șterse.
                        <br />
                        <br />
                        <b>
                            Refuzul dumneavoastră pentru desfășurarea operațiunilor de prelucrare a
                            datelor cu caracter personal și/sau de procesare a documentelor conduce
                            la imposibilitatea derulării unei relații contractuale.
                        </b>
                        <br />
                        <b>
                            Înțeleg că semnătura olografă reprezintă o etapă prealabilă încheierii
                            și executării unui contract și îmi exprim în mod voluntar acordul ca
                            PPC să:
                        </b>
                        <ul>
                            <li>
                                Proceseze datele mele cu caracter personal și să rețină copii ale
                                documentelor necesare pentru încheierea și executarea contractului
                                de furnizare a energiei electrice și/sau a gazelor naturale și/sau
                                pentru prestarea de către PPC a altor servicii conexe/similare
                                detaliate în cadrul contractului;
                            </li>
                            <li>
                                Actualizeze datele mele cu caracter personal, dacă este cazul și
                                doar dacă sunt deja client PPC;
                            </li>
                            <li>
                                Utilizeze și să aplice semnătura captată pe toate documentele
                                necesare pentru încheierea și executarea contractului.
                            </li>
                        </ul>
                        Sub sancțiunile aplicate faptei de fals în declarații prevăzute de Legea nr.
                        286/2009 privind Codul penal, cu modificările și completările ulterioare,
                        declar pe propria răspundere faptul că datele cu caracter personal si
                        documentele pe care urmează să le furnizez către PPC sunt complete și
                        corecte în fiecare detaliu.
                        <br />
                        <br />
                        <br />* prevederile marcate cu * se aplică doar pentru contractarea la
                        distanță prin intermediul partenerilor de vânzări sau online.
                    </div>
                {/*)}*/}
                {/*{session.contract_type === 'b2b' && <div />}*/}
            </Fragment>
        );
    }

    getUploadContent() {
        return (
            <div>
                <br />
                Am primit documentele tale, acestea urmează să fie verificare și procesate.
                <br />
                Revenim cu un mesaj în momentul în care oferta <br />
                și documentele contractuale sunt gata.
            </div>
        );
    }

    checkRedirect() {
        const { session } = this.props;
        if (session.ee_sign_success || session.gaz_sign_success) {
            this.setState({ step: 2, title: 'Documentele Generate' });
            document.body.className = 'bg-white';
        } else if (session.client_upload_agree_date) {
            this.setState({ step: 1 });
        }
    }

    showAgreementOverlay(e) {
        e.preventDefault();
        this.setState({
            showAgreementOverlay: true,
        });
    }

    showUploadOverlay(e) {
        if (e) e.preventDefault();
        this.setState({
            showUploadOverlay: true,
        });
    }

    noFormErrors() {
        return _.isNil(_.find(this.state.formErrors, section => section.length > 0));
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) });
    }

    validateInvoice(flow) {
        const { formErrors } = this.state;
        const { session } = this.props;
        const { address, nlcInfo } = session[`${flow}_loc`];
        if (
            address &&
            nlcInfo &&
            address.county &&
            address.county.distribution &&
            address.county.distribution.distributie_enel
        ) {
            const isEnelCounty = address.county.distribution.distributie_enel == 'D';
            if (
                !isEnelCounty &&
                nlcInfo.piata !== 'PR' &&
                _.isEmpty(this.props.docs[flow].FACT_CLIENT)
            ) {
                if (flow == 'ee') {
                    formErrors.docs.push('Vă rugăm să ataşaţi factura pentru energie electrică.');
                } else if (flow == 'gaz') {
                    formErrors.docs.push('Vă rugăm să ataşaţi factura pentru gaze naturale.');
                }
            }
        }
    }

    handleAgreementClick() {
        const { formErrors } = this.state;
        this.resetFormErrors();
        if (!this.props.signature) {
            formErrors.agreement.push('Vă rugăm să semnați în chenarul de mai sus.');
            this.setState({ formErrors });
        } else {
            this.props.patchSession({ signature_agree_date: 'NOW' });
            this.setState({ agreed: true });
        }
    }

    handleOverlayDismiss(e) {
        e.preventDefault();
        this.setState({
            showAgreementOverlay: false,
        });
    }

    handleUploadDismiss(e) {
        e.preventDefault();
        this.setState({
            showUploadOverlay: false,
        });
        window.location.href = 'https://www.ppcenergy.ro';
    }

    handleTryLaterClick(e) {
        e.preventDefault();
        window.location.href = 'https://www.ppcenergy.ro';
    }

    async handleNextClick() {
        const { formErrors } = this.state;
        const { session } = this.props;
        this.resetFormErrors();
        if (!this.props.id && (!session.contract_type || session.contract_type === 'b2c')) {
            formErrors.docs.push('Vă rugăm să atasati cartea de identitate.');
            this.setState({ formErrors });
        }
        const flow = _.isEmpty(session.ee_loc) ? 'gaz' : 'ee';

        if (session.contract_type === 'b2b') {
            if (_.isEmpty(this.props.docs[flow].REGISTRATION_FISC_CERT)) {
                formErrors.docs.push('Vă rugăm să atasati certificat de inregistrare societate.');
            }
            if (_.isEmpty(this.props.docs[flow].IMPUTERNICIRE_OR_DOC_CONSTITUIVE)) {
                formErrors.docs.push(
                    'Vă rugăm să atașați Imputernicire/Certificat constatator de la registrul comerțului'
                );
            }
            this.setState({ formErrors });
        }

        if (session.type == 'COMBO') {
            const { ee_loc, gaz_loc } = session;
            if (ee_loc) {
                this.validateInvoice('ee');
            }
            if (gaz_loc) {
                this.validateInvoice('gaz');
            }
        }

        const place = _.isEmpty(session.ee_loc) ? session.gaz_loc : session.ee_loc;
        if (!_.isEmpty(place)) {
            const { address, nlcInfo } = session[`${flow}_loc`];
            if (
                address &&
                nlcInfo &&
                address.county &&
                address.county.distribution &&
                address.county.distribution.distributie_enel
            ) {
                const isEnelCounty = address.county.distribution.distributie_enel == 'D';
                const changeOwner = session[`${flow}_schimba_titular`];

                if (
                    !isEnelCounty &&
                    nlcInfo.piata !== 'PR' &&
                    _.isEmpty(this.props.docs[flow].FACT_CLIENT)
                ) {
                    formErrors.docs.push('Vă rugăm să ataşaţi factura.');
                }

                const shouldUploadPlaceDocs =
                    !(
                        isEnelCounty &&
                        nlcInfo.piata == 'PR' &&
                        !changeOwner &&
                        nlcInfo.cnp &&
                        nlcInfo.status !== 'INACTIV'
                    ) &&
                    (session.type == 'COMBO' || !place.declaratie_act_spatiu);

                if (shouldUploadPlaceDocs && _.isEmpty(this.props.docs[flow].ACT_PROPRIETAR)) {
                    formErrors.docs.push('Vă rugăm să ataşaţi actul de spaţiu.');
                }
            }
        }

        if (this.noFormErrors()) {
            this.props.patchSession({ client_upload_agree_date: 'NOW' });
            this.showUploadOverlay();
        }
    }

    renderSections() {
        const { session, isDocLoading } = this.props;
        if (this.state.step == 0) {
            return (
                <Fragment>
                    <ModalOverlay
                        show={this.state.showAgreementOverlay}
                        onClose={this.handleOverlayDismiss}
                    >
                        <ConfirmOverlay
                            title="Prelucrarea datelor"
                            description={this.getAgreementContent()}
                            confirmLabel="Închide"
                            onConfirm={this.handleOverlayDismiss}
                            noDismiss
                            noLogo
                            noFixed
                            show
                            big
                        />
                    </ModalOverlay>
                    <ModalOverlay
                        show={this.state.showUploadOverlay}
                        onClose={this.handleUploadDismiss}
                        middle
                    >
                        <ConfirmOverlay
                            title="Mulțumim!"
                            description={this.getUploadContent()}
                            confirmLabel="Închide"
                            onConfirm={this.handleUploadDismiss}
                            noDismiss
                            noLogo
                            noFixed
                            show
                        />
                    </ModalOverlay>
                    <OfferSection />
                    <SignatureSection />
                    {this.renderFormErrors('agreement')}
                    {!session.signature_agree_date && (
                        <div className="container offset-top agreement-content">
                            Pentru a putea continua, avem nevoie de acordul tău pentru prelucrarea
                            datelor cu caracter personal (semnătura, nume, prenume, adreasă, datele
                            de identificare regăsite în actul de identitate, serie și număr carte de
                            identitate, cod numeric personal). Mai multe detalii despre prelucrarea
                            datelor și procesarea documentelor găsești{' '}
                            <a href="#" onClick={this.showAgreementOverlay}>
                                aici
                            </a>
                            .
                        </div>
                    )}
                    {!session.signature_agree_date && (
                        <div className="text-center offset-top">
                            <Button
                                primary
                                onClick={this.handleAgreementClick}
                                value="Sunt de acord"
                            />
                        </div>
                    )}
                    {session.signature_agree_date && <UploadDocsSection />}
                    {this.renderFormErrors('docs')}
                    {session.signature_agree_date && (
                        <div
                            className={`btn-wrapper text-center offset-top ${
                                isDocLoading() ? 'loading' : ''
                            }`}
                        >
                            <Button
                                primary
                                onClick={this.handleNextClick}
                                className="btn-full-mobile"
                                value="Trimite documente"
                            />
                            <Button
                                primary
                                underline
                                onClick={this.handleTryLaterClick}
                                className="btn-full-mobile"
                                value="Încarcă mai târziu"
                            />
                        </div>
                    )}
                </Fragment>
            );
        }
    }

    renderWaiting() {
        if (this.state.step == 1) {
            return (
                <div className="waiting-status">
                    Mulțumim!
                    <br />
                    <br />
                    Am primit documentele tale, acestea urmează să fie verificare și procesate.
                    <br />
                    Revenim cu un mesaj în momentul în care oferta <br />
                    și documentele contractuale sunt gata.
                </div>
            );
        }
    }

    renderGeneratedDocs() {
        if (this.state.step == 2) {
            return (
                <Section className="GeneratedDocs">
                    <GeneratedDocList />
                </Section>
            );
        }
    }

    renderFormErrors(section) {
        if (this.state.formErrors[section].length > 0) {
            return (
                <div className="container form-error">
                    <FormErrors errors={this.state.formErrors[section]} />
                </div>
            );
        }
    }

    render() {
        return (
            <div className="UploadDocs">
                <HeaderHero
                    title={this.state.title}
                    backgroundColor='#000'
                />
                {this.renderSections()}
                {this.renderWaiting()}
                {this.renderGeneratedDocs()}
            </div>
        );
    }
}

UploadDocs.propTypes = propTypes;
UploadDocs.defaultProps = defaultProps;

const mapStateToProps = state => ({
    session: getSession(state),
    signature: getSignature(state),
    docs: getDocs(state),
    id: getID(state),
    isDocLoading: isDocLoading(state),
});

const mapDispatchToProps = {
    fetchGeneratedDocs,
    patchSession,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UploadDocs);
