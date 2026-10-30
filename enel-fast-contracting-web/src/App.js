import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { loadReCaptcha } from 'react-recaptcha-google';
import { withRouter, browserHistory } from 'react-router';

import ErrorAlert from 'components/alerts/ErrorAlert';
import LoadingOverlay from 'components/overlays/LoadingOverlay';

import 'react-toastify/dist/ReactToastify.min.css';
import strings from './services/strings';

import * as authActions from './store/auth/actions';
import * as exceptionsSelectors from './store/exceptions/selectors';
import { fetchAllItems as fetchStreetTypes } from 'store/streetTypes/actions';
import { fetchAllItems as fetchCounties } from 'store/counties/actions';
import { clearError } from 'store/client/actions';
import { sendRegistrationEmail, saveRegistrationPageURL, resetRegistration } from 'store/registration/actions';

import * as sessionActions from 'store/session/actions';
import { getStep as getLastVisitedStep, getSession } from 'store/session/selectors';
import { hideLoading, showLoading } from 'store/ui/actions';
import { isLoading } from 'store/ui/selectors';
import { getRegistrationNumber, getRegistrationPageURL } from 'store/registration/selectors';

import { patch as patchSession } from 'store/session/actions';

import pageService from 'services/page';

import './App.scss';
import './Responsive.scss';

import IdleTimer from 'react-idle-timer';
import { IDLE_TIMEOUT, REGISTRATION_EMAIL_TYPES, ABANDON_TYPES, ABANDON_LINK } from 'utils/constants/app';

import Footer from 'components/footer/Footer';

import { toRegistrationEmailData } from 'utils/serializers';


const propTypes = {
    exceptions: PropTypes.any,
    children: PropTypes.any,
    login: PropTypes.func.isRequired,
    fetchStreetTypes: PropTypes.func.isRequired,
    fetchCounties: PropTypes.func.isRequired,
    lastStep: PropTypes.number,
    location: PropTypes.object.isRequired,
    setStep: PropTypes.func.isRequired,
    patchSession: PropTypes.func.isRequired,
    sendRegistrationEmail: PropTypes.func.isRequired,
};

const defaultProps = {
    exceptions: {},
    children: {},
};

class App extends Component {
    constructor(props) {
        super(props);
        this.idleTimer = null;
        this.handleOnAction = this.handleOnAction.bind(this);
        this.handleOnActive = this.handleOnActive.bind(this);
        this.handleOnIdle = this.handleOnIdle.bind(this);
    }

    state = {
        validStep: false,
        createSession: false,
    };

    async componentDidMount() {

        this.props.hideLoading();
        this.props.clearError();

        if (this.isHomepage() || this.isOffertaPage()) {
            await this.props.login();
            await this.props.resetSession();
            await this.props.createSession();
            await this.props.resetRegistration();
        }

        this.props.fetchStreetTypes();
        this.props.fetchCounties();

        loadReCaptcha();
        this.checkStep(this.props);

        window.addEventListener('beforeunload', (event) => {
            // event.returnValue = 'Are you sure you want to leave?';
            // TODO check here what can we do on tab close
            this.setAbandonType(ABANDON_TYPES.TAB_CLOSE);
        });

    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            this.props.hideLoading();
        }
        if (this.props.session && (this.props.session.id !== prevProps.session.id) && this.props.session.abandon_type === ABANDON_TYPES.ABORT) {
            window.location = ABANDON_LINK;
        }
    }

    componentWillReceiveProps(nextProps) {
        this.checkStep(nextProps);
    }

    isHomepage() {
        return !this.props.location.pathname.replace('/', '');
    }

    checkStep(props) {
        const currentStep = pageService.getStepFromPage(props.location.pathname.replace('/', ''));
        if (currentStep > props.lastStep + 1 && !(props.lastStep === 10 && currentStep === 12)) {
            window.location = `/${pageService.getPageFromStep(props.lastStep)}`;
        } else if (currentStep > props.lastStep) {
            this.props.setStep(currentStep);
            this.setState({ validStep: true });
        } else {
            this.setState({ validStep: true });
        }
    }

    renderContent() {
        if (this.state.validStep) {
            const children = React.Children.map(this.props.children, child => (
                React.cloneElement(child, {
                    exceptions: this.props.exceptions,
                })
            ));

            return (
                <div>
                    {children}
                    <ErrorAlert />
                </div>
            );
        }
    }

    async handleOnAction(event) {
        this.resetAbandonType();
    }

    async handleOnActive(event) {
        this.resetAbandonType();
    }

    async handleOnIdle() {
        this.setAbandonType(ABANDON_TYPES.IDLE);
    }

    async setAbandonType(type) {
        const { session, registrationNumber } = this.props;
        if (session.client && session.client.email && !session.abandon_type && registrationNumber) {
            await this.props.patchSession({ abandon_type: type });
            await this.props.sendRegistrationEmail(toRegistrationEmailData(session.client, registrationNumber, REGISTRATION_EMAIL_TYPES.INACTIVITY));
        }
    }

    async resetAbandonType() {
        const { session } = this.props;
        const { abandon_type } = session;
        if (abandon_type && [ABANDON_TYPES.IDLE, ABANDON_TYPES.TAB_CLOSE].includes(abandon_type)) {
            await this.props.patchSession({ abandon_type: '' });
        }
    }

    getChatVisibility() {
        const currentUrl = this.props.location;
        return ![
            '/',
            '/oferta',
        ].includes(currentUrl.pathname);
    }

    isOffertaPage() {
        const currentUrl = this.props.location;
        return [
            '/oferta',
        ].includes(currentUrl.pathname);
    }

    getButtonsVisibility() {
        const currentUrl = this.props.location;
        return ![
            '/',
            'alege-oferta',
            '/alege-oferta',
            'acord-preluare-si-procesare-date',
            '/acord-preluare-si-procesare-date',
            '/oferta',
            '/documentele-sunt-gata',
        ].includes(currentUrl.pathname);
    }

    isOffertaPage() {
        const currentUrl = this.props.location;
        return [
            '/oferta',
        ].includes(currentUrl.pathname);
    }

    render() {
        return (
            <div className="App">
                <IdleTimer
                    ref={(ref) => { this.idleTimer = ref; }}
                    timeout={IDLE_TIMEOUT}
                    onActive={this.handleOnActive}
                    onIdle={this.handleOnIdle}
                    onAction={this.handleOnAction}
                    debounce={250}
                />
                {this.renderContent()}
                <Footer
                    showChat={this.getChatVisibility()}
                    location={this.props.location}
                    showLoading={this.props.showLoading}
                    hideLoading={this.props.hideLoading}
                    showButtons={this.getButtonsVisibility()}
                />
                <LoadingOverlay />
            </div>
        );
    }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({
    exceptions: exceptionsSelectors.getItems(state),
    lastStep: getLastVisitedStep(state),
    loading: isLoading(state),
    session: getSession(state),
    registrationNumber: getRegistrationNumber(state),
    registrationPageURL: getRegistrationPageURL(state),
});

const mapDispatchToProps = {
    setStep: sessionActions.setStep,
    login: authActions.login,
    logout: authActions.logout,
    createSession: sessionActions.create,
    resetSession: sessionActions.reset,
    fetchStreetTypes,
    fetchCounties,
    hideLoading,
    showLoading,
    clearError,
    patchSession,
    sendRegistrationEmail,
    saveRegistrationPageURL,
    resetRegistration,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));

