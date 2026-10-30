import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import animateScrollTo from 'animated-scroll-to';
import { browserHistory } from 'react-router';
import _ from 'lodash';
import { getItem as getVoucher } from 'store/voucher/selectors';
import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import * as countiesSelectors from 'store/counties/selectors';
import { getSession, isFlowSigned } from 'store/session/selectors';
import { isFastFlux, isLinkSent } from 'store/client/selectors';
import { isDocUploaded } from 'store/documents/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';

import { isTS, ROLES } from 'services/user';
import { clearCache as clearVoucher } from 'store/voucher/actions';
import pageService from 'services/page';

import { fetchAllItems as fetchCities } from 'store/cities/actions';
import { fetchAllItems as fetchStreets } from 'store/streets/actions';
import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import {
    clearCache as clearClient,
    markIncompleteDocs,
    sendSessionLink,
    sendTestSMS,
    setSessionLink,
} from 'store/client/actions';
import { clearCache as clearCampaigns } from 'store/campaigns/actions';
import { clearCache as clearDiscounts } from 'store/discounts/actions';
import { checkDocs, checkSigned, clearCache as clearDocs } from 'store/documents/actions';
import {
    clearData as clearSession,
    createOffer,
    patch as patchSession,
    rejectOffer,
    restore as restoreSession,
    signOffer,
} from 'store/session/actions';

import { clearCache as clearOffers, setCurrentPlan } from 'store/offers/actions';

import MainLayout from 'layouts/MainLayout';
import Stepper from 'components/Stepper';
import SendLinkModal from 'components/modals/SendLinkModal';
import RejectModal from 'components/modals/RejectModal';
import ConfirmModal from 'components/modals/ConfirmModal';

import ClientInfoSection from 'sections/ClientInfoSection';
import ContractOptionsSection from 'sections/ContractOptionsSection';
import PlaceInfoSection from 'sections/PlaceInfoSection';
import PlanOptionsSection from 'sections/PlanOptionsSection';
import AgentSignatureSection from 'sections/AgentSignatureSection';
import ContractReviewSection from 'sections/ContractReviewSection';
import { isEmail } from 'validator';
import './SessionDetails.scss';

class SessionDetails extends Component {
    state = {
        isEdit: false,
        totalSteps: 6,
        discoveredSteps: 1,
        currentStep: 1,
        isLoading: false,
        error: '',
        docError: '',
        generateStatus: {
            step: null,
            flow: null,
        },
    };

    sendLinkModal = React.createRef();
    incompleteDocsModal = React.createRef();
    rejectModal = React.createRef();
    sectionsWrapper = React.createRef();

    sections = {
        clientInfo: null,
        placeInfo: null,
        contractOptions: null,
    };

    handleScroll = _.throttle(() => {
        if (this.sectionsWrapper.current) {
            const sections = this.sectionsWrapper.current.children;
            for (let i = 0; i < sections.length; i++) {
                const position = sections[i].getBoundingClientRect();
                if (i === 0) {
                    if (!this.scrollReference) {
                        this.direction = 0;
                        this.scrollReference = position.top;
                    }

                    this.direction = this.scrollReference - position.top;
                    this.scrollReference = position.top;
                }

                const screenReference = window.innerHeight * 0.5;

                if (
                    (this.direction > 0 && position.top > 0 && position.top < screenReference) ||
                    (this.direction < 0 &&
                        position.bottom > screenReference &&
                        position.bottom < window.innerHeight)
                ) {
                    this.setState({ currentStep: i + 1 });
                    break;
                }
            }
        }
    }, 100);

    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
        this.props.fetchCounties();

        const params = this.props.location.pathname.split('/');
        const id = params[2];
        const hash = params[3];
        if (id && hash) {
            this.setState({ isEdit: true }, async () => {
                await this.props.restoreSession({ id, hash });
                const { session } = this.props;
                if (session.ee_serviciu || session.gaz_serviciu) {
                    const plan = [session.ee_serviciu, session.gaz_serviciu].filter(item => item);
                    await this.props.setCurrentPlan(plan);
                }
                this.discoverEditSteps();
                this.props.checkDocs();
            });
        }

        this.docsInterval = setInterval(this.props.checkDocs, 5000);
        this.signedInterval = '';
    }

    async componentDidUpdate(prevProps, prevState) {
        const { session, setSessionLink, authUser } = this.props;
        const { isEdit, currentStep } = this.state;

        if (isEdit && _.isEmpty(prevProps.session) && !_.isEmpty(session)) {
            if (session.link_sent_date) {
                setSessionLink(session);
            }
        }
        if (
            authUser &&
            (authUser.role === ROLES.CM || authUser.role === ROLES.AGENT) &&
            prevState.currentStep !== currentStep &&
            currentStep === 5
        ) {
            await this.validateDocs();
            if (!this.state.docError && !session.client_upload_agree_date) {
                this.props.patchSession({ client_upload_agree_date: 'NOW' });
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        clearInterval(this.docsInterval);
        clearInterval(this.signedInterval);
        this.props.clearCampaigns();
        this.props.clearDiscounts();
        this.props.clearSession();
        this.props.clearVoucher();
        this.props.clearOffers();
        this.props.clearDocs();
        this.props.clearClient();
    }

    getSendLinkContact() {
        const { session } = this.props;

        if (!_.isEmpty(session)) {
            const contact = session.ee_contact || session.gaz_contact;
            if (contact && (contact.email || contact.telefon)) {
                return contact.email || contact.telefon;
            }
        }
    }

    getContractReviewStep() {
        const { authUser } = this.props;
        return isTS(authUser) ? 6 : 5;
    }

    setStep(step) {
        return new Promise(resolve => {
            setTimeout(() => {
                this.setState({ currentStep: step }, () => {
                    resolve();
                });
            }, 500);
        });
    }

    setError(error) {
        return new Promise(resolve => {
            this.setState({ error }, resolve);
        });
    }

    setDocError(docError) {
        return new Promise(resolve => {
            this.setState({ docError }, resolve);
        });
    }

    isCurrentStep(step) {
        return this.state.currentStep === step;
    }

    shouldDisplaySection(step) {
        return step <= this.state.discoveredSteps;
    }

    discoverStep(step) {
        return new Promise(resolve => {
            this.setState({ discoveredSteps: step }, () => {
                resolve();
            });
        });
    }

    discoverEditSteps() {
        const { session, authUser } = this.props;
        this.discoverStep(2);

        if (!_.isEmpty(session.ee_loc) || !_.isEmpty(session.gaz_loc)) {
            this.discoverStep(3);
        }

        if (!_.isEmpty(session.ee_factura) || !_.isEmpty(session.gaz_factura)) {
            this.discoverStep(4);
        }

        if (isTS(authUser)) {
            this.discoverStep(5);
        }

        if (!_.isEmpty(session.ee_serviciu) || !_.isEmpty(session.gaz_serviciu)) {
            this.discoverStep(this.getContractReviewStep());
        }
    }

    goToStep(step) {
        return new Promise(async resolve => {
            if (step <= this.state.totalSteps) {
                if (step > this.state.discoveredSteps) {
                    await this.discoverStep(step);
                }
                Array.from(document.getElementsByClassName('Section')).forEach(section => {
                    if (section.dataset.step === step.toString()) {
                        animateScrollTo(section, {
                            offset: -100,
                            minDuration: 600,
                        });
                    }
                });
                setTimeout(resolve, 800);
            } else {
                resolve();
            }
        });
    }

    async validateSteps() {
        await this.sections.clientInfo.handleNextClick();
        await this.sections.placeInfo.handleNextClick();
        await this.sections.contractOptions.handleNextClick();
    }

    async validateInvoice(flow) {
        const { session, isDocUploaded } = this.props;
        const { address, nlcInfo } = session[`${flow}_loc`];
        if (address && nlcInfo) {
            const isEnelCounty =
                !_.isNil(address.county.distribution.distributie_enel) &&
                address.county.distribution.distributie_enel === 'D';
            if (!isEnelCounty && nlcInfo.piata !== 'PR' && !isDocUploaded('FACT_CLIENT', flow)) {
                if (flow === 'ee') {
                    return await this.setDocError(
                        'Vă rugăm să ataşaţi factura pentru energie electrică.'
                    );
                } else if (flow === 'gaz') {
                    return await this.setDocError(
                        'Vă rugăm să ataşaţi factura pentru gaze naturale.'
                    );
                }
            }
        }
    }

    async validateDocs() {
        await this.setDocError(null);
        const { session, isDocUploaded, isFastFlux } = this.props;

        if (isFastFlux) {
            return;
        }

        if (session.type === 'COMBO') {
            await this.validateInvoice('gaz');
            await this.validateInvoice('ee');
        }

        if (this.state.docError) {
            return;
        }

        const place = _.isEmpty(session.ee_loc) ? session.gaz_loc : session.ee_loc;
        const flow = _.isEmpty(session.ee_loc) ? 'gaz' : 'ee';

        if (!isDocUploaded('CI')) {
            return await this.setDocError('Cartea de identitate trebuie incarcata.');
        }

        if (!_.isEmpty(place)) {
            const { address, nlcInfo } = session[`${flow}_loc`];
            if (address && nlcInfo) {
                const isEnelCounty =
                    !_.isNil(address.county.distribution) &&
                    !_.isNil(address.county.distribution.distributie_enel) &&
                    address.county.distribution.distributie_enel === 'D';
                const changeOwner = session[`${flow}_schimba_titular`];

                if (
                    !isEnelCounty &&
                    nlcInfo.piata !== 'PR' &&
                    !isDocUploaded('FACT_CLIENT', flow)
                ) {
                    return await this.setDocError('Factura trebuie incarcata.');
                }

                const shouldUploadPlaceDocs =
                    /* !(
                        isEnelCounty &&
                        nlcInfo.piata === 'PR' &&
                        !changeOwner &&
                        nlcInfo.cnp // &&
                        nlcInfo.status !== 'INACTIV'
                    ) && */
                    session.type == 'COMBO' || !place.declaratie_act_spatiu;

                if (shouldUploadPlaceDocs && !isDocUploaded('ACT_PROPRIETAR', flow)) {
                    return await this.setDocError('Actul de spatiu trebuie incarcat.');
                }
            }
        }
    }

    isValid(includeDocs) {
        if (includeDocs && this.state.docError) return false;
        return (
            this.sections.clientInfo.isValid() &&
            this.sections.placeInfo.isValid() &&
            this.sections.contractOptions.isValid() &&
            !this.state.error
        );
    }

    setGenerateStatus(step = null, flow = null) {
        const { generateStatus } = this.state;

        this.setState({
            generateStatus: {
                ...generateStatus,
                step,
                flow,
            },
        });
    }

    async handleBeforePlanSelect(e) {
        await this.sections.placeInfo.handleNextClick();
        if (!this.isValid()) {
            pageService.scrollToError();
            throw new Error('NOT_VALID');
        }
    }

    handlePlanSelect(e) {
        this.handleNextClick(e, 4);
    }

    handleNextClick(e, step) {
        this.goToStep(step + 1);
    }

    handleContractOptionsClick(e) {
        const { isLinkSent } = this.props;
        this.handleNextClick(e, isLinkSent ? 4 : 3);
    }

    async handleSendClick() {
        await this.validateSteps();
        if (this.isValid()) {
            this.sendLinkModal.current.show();
        } else {
            if (!this.sections.clientInfo.state.insurance.isValid) {
                await this.goToStep(1);
                this.sections.clientInfo.showInsuranceErrorModal();
            } else {
                pageService.scrollToError();
            }
        }
    }

    handleIncompleteDocsClick(e) {
        this.incompleteDocsModal.current.show();
    }

    handleRejectClick(e) {
        this.rejectModal.current.show();
    }

    async handleGenrateDocument() {
        this.genrateDocument = true;
        this.handleSendClick();
    }

    async handleGenerateClick() {
        if (this.state.isLoading) return;

        this.setState({ isLoading: true });
        await this.validateSteps();
        await this.validateDocs();
        if (this.isValid(true)) {
            const { session, isFlowSigned } = this.props;
            const channel = session.ee_contact.telefon ? 'SMS' : 'EMAIL';
            const flow = session.type.toLowerCase();

            try {
                if (session.type === 'COMBO') {
                    if (!isFlowSigned('ee')) {
                        this.setGenerateStatus('CREATE', 'ee');
                        await this.props.createOffer('EE');
                        this.setGenerateStatus('SIGN', 'ee');
                        await this.props.signOffer('EE', channel);
                    }

                    if (!isFlowSigned('gaz')) {
                        this.setGenerateStatus('CREATE', 'gaz');
                        await this.props.createOffer('GAZ');
                        this.setGenerateStatus('SIGN', 'gaz');
                        await this.props.signOffer('GAZ', channel);
                    }

                    this.setGenerateStatus();
                } else {
                    this.setGenerateStatus('CREATE', flow);
                    await this.props.createOffer(session.type);
                    this.setGenerateStatus('SIGN', flow);
                    await this.props.signOffer(session.type, channel);

                    this.setGenerateStatus();
                }
                this.genrateDocument = false;
                this.setState({ isLoading: false });
                browserHistory.push('/');
            } catch (error) {
                if (error.message !== 'SOAP_DOCOUT') {
                    this.setState({
                        isLoading: false,
                        error: error.message || '',
                    });
                } else {
                    this.setState({
                        isLoading: true,
                        error: error.message || '',
                    });

                    const currentSess = this.props.session;
                    const self = this;

                    this.signedInterval = setInterval(async function() {
                        const signed = await self.props.checkSigned(currentSess.type);

                        if (typeof signed !== 'undefined' && signed.length > 0) {
                            self.setGenerateStatus('SIGN', currentSess.type.toLowerCase());
                            await self.props.signOffer(
                                currentSess.type,
                                currentSess.ee_contact.telefon ? 'SMS' : 'EMAIL'
                            );
                            self.setGenerateStatus();
                            clearInterval(self.signedInterval);
                            self.setState({ isLoading: false });
                            browserHistory.push('/');
                        }
                    }, 5000);
                }
            }
        } else {
            this.setState({ isLoading: false });
            if (!this.sections.clientInfo.state.insurance.isValid) {
                await this.goToStep(1);
                this.sections.clientInfo.showInsuranceErrorModal();
            } else {
                pageService.scrollToError();
            }
        }
    }

    async handleSendConfirm(e, contact) {
        const { session } = this.props;

        this.setState({ invalidContact: null });
        // No Blacklist check needed on Telesales
        try {
            if (session.id) {
                // No Blacklist check needed on Telesales
                // if (isEmail(contact)) {
                //     await this.props.validateEmail(contact, session.id);
                // } else {
                //     await this.props.validatePhone(contact, session.id);
                // }
                if (isEmail(contact)) {
                    session['ee_contact'].email = contact;
                    session['ee_contact_email'] = contact;
                    session['gaz_contact'].email = contact;
                    this.clientInfoSectionApi.setValue('contact_email', contact);
                } else {
                    session['ee_contact'].telefon = contact;
                    session['gaz_contact'].telefon = contact;
                    this.clientInfoSectionApi.setValue('contact_telefon', contact);
                }
                // await this.props.patchSession(session);
            }

            if (this.props.voucher.voucher_id) {
                if (!session['voucher']) {
                    session['voucher'] = {};
                }
                const { values } = this.statusSectionApi.getState();
                debugger;
                session['voucher']['voucherCode'] = this.props.voucher.voucher_id;
                session['voucher']['isFriend'] = values['eneltel_0'] ? true : false;
                session['voucher']['eneltel'] = values['eneltel_0'];
            }
            await this.props.patchSession(session);
            // this.props.session = session;
            if (this.genrateDocument === true) {
                this.handleGenerateClick();
            } else {
                this.props.sendSessionLink(session.id, contact);
            }
        } catch (error) {
            /* if (isEmail(contact)) {
                this.setState({
                    invalidContact:
                        'E-mailul se afla in blacklist sau este disposable. Contractarea necesita un alt e-mail.',
                });
            } else {
                this.setState({
                    invalidContact:
                        'Telefonul mobil se afla in blacklist. Contractarea necesita un alt numar de telefon.',
                });
            } */
        }
    }

    handleIncompleteDocsConfirm(e) {
        const { session } = this.props;
        if (session.id) {
            this.props.markIncompleteDocs(session.id);
        }
    }

    async handleRejectConfirm(e, reason) {
        const { session, rejectOffer } = this.props;
        if (session.id) {
            if (session.type === 'COMBO') {
                await rejectOffer(session.id, 'EE', reason);
                await rejectOffer(session.id, 'GAZ');
            } else {
                await rejectOffer(session.id, session.type, reason);
            }
        }
    }

    handleTestSMSClick() {
        const { session } = this.props;
        if (session.id) {
            this.props.sendTestSMS();
        }
    }

    setClientInfoSectionApi = api => {
        this.clientInfoSectionApi = api;
    };

    setStatusSectionApi = api => {
        this.statusSectionApi = api;
    };

    render() {
        const { session, authUser } = this.props;
        return (
            <MainLayout>
                <ConfirmModal
                    title="Esti sigur ca vrei sa trimiti reminder cu documente incomplete?"
                    confirmLabel="Trimite reminder"
                    dismissLabel="Anuleaza"
                    ref={this.incompleteDocsModal}
                    onConfirm={this.handleIncompleteDocsConfirm}
                />
                <SendLinkModal
                    contact={this.getSendLinkContact()}
                    ref={this.sendLinkModal}
                    onConfirm={this.handleSendConfirm}
                    disableInput={
                        !session.is_fast_flow &&
                        session.status !== 'NEW' &&
                        session.status !== 'OFFER' &&
                        session.status !== 'OFFER_ERR'
                    }
                    // disableInput={!!session.client_upload_agree_date}
                />
                <RejectModal ref={this.rejectModal} onConfirm={this.handleRejectConfirm} />
                <div className="SessionDetails wrapper-content">
                    <div className="sections-wrapper" ref={this.sectionsWrapper}>
                        <ClientInfoSection
                            step={1}
                            isCurrent={this.isCurrentStep(1)}
                            isEdit={this.state.isEdit}
                            show={this.shouldDisplaySection(1)}
                            onNextClick={e => this.handleNextClick(e, 1)}
                            onMount={section => (this.sections.clientInfo = section)}
                            onUnmount={() => (this.sections.clientInfo = null)}
                            getApi={this.setClientInfoSectionApi}
                        />
                        <PlaceInfoSection
                            step={2}
                            isCurrent={this.isCurrentStep(2)}
                            isEdit={this.state.isEdit}
                            show={this.shouldDisplaySection(2)}
                            onNextClick={e => this.handleNextClick(e, 2)}
                            onMount={section => (this.sections.placeInfo = section)}
                            onUnmount={() => (this.sections.placeInfo = null)}
                        />
                        <ContractOptionsSection
                            step={3}
                            isCurrent={this.isCurrentStep(3)}
                            isEdit={this.state.isEdit}
                            show={this.shouldDisplaySection(3)}
                            onNextClick={this.handleContractOptionsClick}
                            onMount={section => (this.sections.contractOptions = section)}
                            onUnmount={() => (this.sections.contractOptions = null)}
                        />
                        <PlanOptionsSection
                            step={4}
                            isCurrent={this.isCurrentStep(4)}
                            isEdit={this.state.isEdit}
                            show={this.shouldDisplaySection(4)}
                            beforePlanSelect={this.handleBeforePlanSelect}
                            onPlanSelect={this.handlePlanSelect}
                            goToStep={this.goToStep}
                        />
                        {isTS(authUser) && (
                            <AgentSignatureSection
                                step={5}
                                isCurrent={this.isCurrentStep(5)}
                                isEdit={this.state.isEdit}
                                show={this.shouldDisplaySection(5)}
                                onNextClick={e => this.handleNextClick(e, 5)}
                            />
                        )}
                        <ContractReviewSection
                            step={this.getContractReviewStep()}
                            isCurrent={this.isCurrentStep(this.getContractReviewStep())}
                            isEdit={this.state.isEdit}
                            isLoading={this.state.isLoading}
                            show={this.shouldDisplaySection(this.getContractReviewStep())}
                            onSendClick={this.handleSendClick}
                            onIncompleteDocsClick={this.handleIncompleteDocsClick}
                            onGenerateClick={this.handleGenrateDocument}
                            // onGenerateClick={this.handleGenerateClick}
                            voucher={this.state.voucher}
                            onRejectClick={this.handleRejectClick}
                            onTestSMSClick={this.handleTestSMSClick}
                            getApi={this.setStatusSectionApi}
                            error={
                                this.state.docError || this.state.error || this.state.invalidContact
                            }
                            generateStatus={this.state.generateStatus}
                        />
                    </div>
                </div>
                <div className="stepper-wrapper">
                    <Stepper
                        total={this.state.discoveredSteps}
                        current={this.state.currentStep}
                        onClick={this.goToStep}
                    />
                </div>
            </MainLayout>
        );
    }
}

const mapStateToProps = state => ({
    cities: getCities(state),
    streets: getStreets(state),
    counties: countiesSelectors.getItems(state),
    session: getSession(state),
    isFlowSigned: isFlowSigned(state),
    isLinkSent: isLinkSent(state),
    isFastFlux: isFastFlux(state),
    isDocUploaded: isDocUploaded(state),
    authUser: getAuthUser(state),
    voucher: getVoucher(state),
});

const mapDispatchToProps = {
    fetchCounties,
    fetchCities,
    fetchStreets,
    restoreSession,
    rejectOffer,
    sendSessionLink,
    markIncompleteDocs,
    sendTestSMS,
    setSessionLink,
    clearCampaigns,
    clearDiscounts,
    createOffer,
    signOffer,
    setCurrentPlan,
    clearSession,
    patchSession,
    clearClient,
    clearOffers,
    clearDocs,
    checkDocs,
    //validateEmail,
    //validatePhone,
    checkSigned,
    clearVoucher,
};

export default connect(mapStateToProps, mapDispatchToProps)(SessionDetails);
