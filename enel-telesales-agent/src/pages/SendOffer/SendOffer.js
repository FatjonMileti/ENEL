import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import animateScrollTo from 'animated-scroll-to';
import _ from 'lodash';

import { getItems as getCities } from 'store/cities/selectors';
import { getItems as getStreets } from 'store/streets/selectors';
import * as countiesSelectors from 'store/counties/selectors';
import { getSession, isFlowSigned } from 'store/session/selectors';
import { isFastFlux, isLinkSent } from 'store/client/selectors';
import { isDocUploaded } from 'store/documents/selectors';
import { getUser as getAuthUser } from 'store/auth/selectors';

import { isTS, ROLES } from 'services/user';

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
    validateEmail,
    validatePhone,
} from 'store/client/actions';
import { clearCache as clearCampaigns } from 'store/campaigns/actions';
import { checkDocs, clearCache as clearDocs } from 'store/documents/actions';
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

import SendOfferSection from 'sections/SendOfferSection';

import OfferReviewSection from 'sections/OfferReviewSection';

import './SendOffer.scss';

class SendOffer extends Component {
    state = {
        isEdit: false,
        totalSteps: 2,
        discoveredSteps: 2,
        currentStep: 1,
        isLoading: false,
        error: '',
        docError: '',
        generateStatus: {
            step: null,
            flow: null,
        },
    };

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
            authUser.role === ROLES.CM &&
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
        this.props.clearCampaigns();
        this.props.clearSession();
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
                    if (section.dataset.step === step) {
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
            const isEnelCounty = address.county.distribution.distributie_enel === 'D';
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
                const isEnelCounty = address.county.distribution.distributie_enel === 'D';
                const changeOwner = session[`${flow}_schimba_titular`];

                if (
                    !isEnelCounty &&
                    nlcInfo.piata !== 'PR' &&
                    !isDocUploaded('FACT_CLIENT', flow)
                ) {
                    return await this.setDocError('Factura trebuie incarcata.');
                }

                const shouldUploadPlaceDocs =
                    !(
                        isEnelCounty &&
                        nlcInfo.piata === 'PR' &&
                        !changeOwner &&
                        nlcInfo.cnp &&
                        nlcInfo.status !== 'INACTIV'
                    ) &&
                    (session.type === 'COMBO' || !place.declaratie_act_spatiu);

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

    render() {
        return (
            <MainLayout>
                <div className="SendOffer wrapper-content">
                    <div className="sections-wrapper" ref={this.sectionsWrapper}>
                        <SendOfferSection
                            step={1}
                            isCurrent={this.isCurrentStep(1)}
                            isEdit={this.state.isEdit}
                            show={this.shouldDisplaySection(1)}
                            beforePlanSelect={this.handleBeforePlanSelect}
                            onPlanSelect={this.handlePlanSelect}
                        />

                        <OfferReviewSection
                            step={2}
                            isCurrent={this.isCurrentStep(2)}
                            isEdit={this.state.isEdit}
                            senOfferClient={this.sendOfferToClient}
                            isLoading={this.state.isLoading}
                            show={this.shouldDisplaySection(2)}
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
    createOffer,
    signOffer,
    setCurrentPlan,
    clearSession,
    patchSession,
    clearClient,
    clearOffers,
    clearDocs,
    checkDocs,
    validateEmail,
    validatePhone,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SendOffer);
