import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import * as authActions from 'store/auth/actions';
import * as sessionActions from 'store/session/actions';
import { setCurrentPlan } from 'store/offers/actions';
import { fetchDocs, fetchID, fetchSignature, fetchGeneratedDocs } from 'store/documents/actions';
import { getSession } from 'store/session/selectors';
import _ from 'lodash';
import './App.scss';
import { useLocation } from 'react-router-dom';
import UploadDocs from './pages/UploadDocs';

const TYPES = {
    ACT_PROPRIETAR: 'Act spaţiu',
    CER: 'Certificat Racordare',
    ATR: 'Aviz Tehnic de Racordare',
    DOC_ACORD_ACCES: 'Acord Acces',
    ALTELE: 'Alte Documente',
    FACT_CLIENT: 'Factura',
};

const B2BTYPES = {
    REGISTRATION_FISC_CERT: 'Certificat de inregistrare societate',
    IMPUTERNICIRE_OR_DOC_CONSTITUIVE:
        'Imputernicire/Certificat constator de la registrul comertului',
    // DOC_CONSTITUIVE:
    //     'Actul constitutiv sau statutul/certificatul constatator de la registrulcomerțului',
};

const propTypes = {
    login: PropTypes.func.isRequired,
    restoreSession: PropTypes.func.isRequired,
    resetSession: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    fetchDocs: PropTypes.func.isRequired,
    fetchID: PropTypes.func.isRequired,
    fetchSignature: PropTypes.func.isRequired,
    fetchGeneratedDocs: PropTypes.func.isRequired,
};

const defaultProps = {};

class App extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    async componentDidMount() {
        const { pathname } = this.props.location;
        const [id, hash] = pathname.substr(1).split('/');

        if (!id || !hash) {
            window.location.href = 'https://www.ppcenergy.ro';
        }

        await this.props.login();
        try {
            await this.props.resetSession();
            await this.props.restoreSession({ id, hash });
        } catch (error) {
            // window.location.href = 'https://enel.ro';
        }

        const { session } = this.props;

        if (session.ee_agree === false || session.gaz_agree === false) {
            return (window.location.href =
                'https://www.ppcenergy.ro/pagina-confirmare/pagina-inexistenta');
        }

        if (session.is_fast_flow && !session.ee_sign_success && !session.gaz_sign_success) {
            return (window.location.href = 'https://www.ppcenergy.ro');
        }

        if (session.ee_serviciu || session.gaz_serviciu) {
            const plan = [session.ee_serviciu, session.gaz_serviciu].filter((item) => item);
            await this.props.setCurrentPlan(plan);
        }

        this.fetchAllDocs();
    }

    fetchAllDocs() {
        const { session } = this.props;
        this.props.fetchID();
        if (session.contract_type === 'b2b') {
            _.map(B2BTYPES, (value, key) => {
                this.props.fetchDocs('EE', key);
                this.props.fetchDocs('GAZ', key);
            });
        }
        this.props.fetchSignature();

        _.map(TYPES, (value, key) => {
            this.props.fetchDocs('EE', key);
            this.props.fetchDocs('GAZ', key);
        });

        if (session.type == 'COMBO') {
            this.props.fetchGeneratedDocs('EE');
            this.props.fetchGeneratedDocs('GAZ');
        } else {
            this.props.fetchGeneratedDocs(session.type);
        }
    }

    render() {
        return (
            <div className="App">
                <UploadDocs />
            </div>
        );
    }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
    session: getSession(state),
    // loading: isLoading(state),
});

const mapDispatchToProps = {
    login: authActions.login,
    restoreSession: sessionActions.restore,
    resetSession: sessionActions.reset,
    setCurrentPlan,
    fetchDocs,
    fetchID,
    fetchSignature,
    fetchGeneratedDocs,
    // showLoading,
};

const LocationComponent = (props) => {
    const location = useLocation();
    return <App location={location} {...props} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(LocationComponent);
