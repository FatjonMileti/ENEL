import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import { getGeneratedDocs } from 'store/documents/selectors';
import { getCurrentPlan } from 'store/offers/selectors';
import { getFlow } from 'store/client/selectors';

import { fetchGeneratedDocs } from 'store/documents/actions';
import { setFlow, markAction } from 'store/client/actions';
import { acceptOffer, rejectOffer } from 'store/session/actions';

import HeaderHero from 'components/heroes/HeaderHero';
import offerService from 'services/offer';
import pageService from 'services/page';
import FormErrors from 'components/FormErrors';
import { getSession } from 'store/session/selectors';

import './ContractReview.scss';

const propTypes = {
    docs: PropTypes.array,
    plan: PropTypes.object,
    flow: PropTypes.string,
    session: PropTypes.object,
    fetchGeneratedDocs: PropTypes.func.isRequired,
    setFlow: PropTypes.func.isRequired,
    acceptOffer: PropTypes.func.isRequired,
    rejectOffer: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    docs: [],
    plan: {},
    flow: '',
    session: {
        client: {},
    },
};

class ContractReview extends Component {

    formErrors = {
        accept: [],
    };

    state = {
        accepted: false,
        formErrors: this.formErrors,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.fetchGeneratedDocs();

        this.props.markAction(pageService.actions.REVIEW_DOCUMENTE.value);
    }

    getDocTitle(doc) {
        return (doc.type || '').replace('.pdf', '');
    }

    getDownloadAllURL() {
        const ZIP_NAME = 'Documente.zip';
        if (this.props.docs && this.props.docs.length) {
            const { url } = this.props.docs[0];
            const docName = url.match(/.*\/(.*)\?.*/)[1];

            return url.replace(docName, ZIP_NAME);
        }

        return '#';
    }

    handleDownloadAll() {
        this.props.markAction(pageService.actions.CONTRACTE_PRINTALL.value);
    }

    handleAcceptChange(e) {
        this.setState({ accepted: !this.state.accepted });
    }

    noFormErrors() {
        return (_.isNil(_.find(this.state.formErrors, section => section.length > 0)));
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) });
    }

    validateAccepted() {
        const { formErrors } = this.state;
        if (!this.state.accepted) {
            formErrors.accept.push('Trebuie sa fiți de acord cu încheierea contractului de furnizare.');
            this.setState({
                formErrors,
            });
        }
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

    async handleAcceptClick(e) {
        e.preventDefault();
        this.resetFormErrors();
        this.validateAccepted();
        const a = this.noFormErrors();

        if (this.noFormErrors()) {

            const {session} =  this.props
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'online_contract',
                'step': 14,
                'response': "accept",
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });
            const plan = offerService.getPlanDetails(this.props.plan);
            await this.props.acceptOffer();
            if (this.props.flow.toUpperCase() == 'EE' && plan.serviciu.toUpperCase() == 'COMBO') {
                await this.props.setFlow('GAZ');
                browserHistory.push(pageService.links['client-invoice-scan']);
            } else {
                await this.props.markAction(pageService.actions.CONTRACTE_ACCEPTATE.value);
                browserHistory.push(pageService.links['thank-you']);
            }
        }
    }

    async handleRejectClick(e) {
        e.preventDefault();
        await this.props.rejectOffer();
        const {session} =  this.props
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event' : 'online_contract',
            'step': 14,
            'response': "refuse",
            'client_type': session.contract_type === "b2c" ? "residential" : "business",
            'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
        });
        await this.props.markAction(pageService.actions.CONTRACTE_REFUZATE.value);
        window.location = 'https://www.ppcenergy.ro';
    }

    renderDocs() {
        return _.map(this.props.docs, doc => (
            <div key={_.uniqueId()} className="card card-serv">
                <a href={doc.url} target="_blank" className="card-body" rel="noreferrer">
                    <h4 className="card-title">
                        Document <span className="separator">|</span> {moment().format('DD MMM YYYY')}
                    </h4>
                    <p className="card-text">{this.getDocTitle(doc)}</p>
                    <div className="doc-type hide-mobile">PDF ({doc.size})</div>
                    <div className="btn btn-outline-secondary hide-mobile">Descarcă</div>
                </a>
            </div>
        ));
    }

    render() {
        return (
            <div className="ContractReview">
                <HeaderHero
                    title="Documentele sunt gata"
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                <div className="main-content">
                    <div className="page-description">
                        Ne bucurăm că ai ales PPC!<br />
                        Mai ai doar un pas: acceptarea contractului prin bifarea căsuței de Accept de mai jos. Contractul, anexele și restul documentelor cu privire la furnizare sunt gata pentru a fi descărcate și salvate. După ce vom primi acceptul tău, documentele vor fi disponibile pe acest link timp de 15 zile de la data emiterii lor.
                    </div>
                </div>
                <div className="main-content bottom-margin" >
                    <div className="row">
                        <div className="col-12">
                            <div className="card-set set-electricitat">
                                {this.renderDocs()}
                                <a
                                    href={this.getDownloadAllURL()}
                                    target="_blank"
                                    className="btn btn-outline-secondary btn-full-mobile btn-download-all"
                                    onClick={this.handleDownloadAll}
                                    rel="noreferrer"
                                >
                                    Descarcă toate documentele
                                </a>
                            </div>
                            {this.renderFormErrors('accept')}
                            <div className="agreement spaced-top">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input" id="accept-email" checked={this.state.accepted} onChange={this.handleAcceptChange} />
                                    <label className="custom-control-label" htmlFor="accept-email">Am citit și sunt de acord cu încheierea contractului de furnizare*</label>
                                </div>
                            </div>
                            <div className="text-center spaced-top buttons">
                                <button type="submit" className="btn btn-outline-secondary" onClick={this.handleRejectClick}>Nu sunt de acord
                                </button>
                                <button type="submit" className="btn btn-primary" onClick={this.handleAcceptClick}>Sunt de acord
                                </button>
                            </div>
                            <div className="spaced-top">
                                <br />
                                <p className="disclaimer"><span className="disclaimer-star">*</span>Acceptarea contractului implică o obligație viitoare de plata a facturilor emise. <br />După acceptare documentelor contractuale, ele vor fi disponibile pentru descărcare timp de 90 de zile.</p>
                                <p className="disclaimer">În cazul în care contractul de furnizare a energiei electrice/gazelor naturale nu este finalizat, prin acceptarea tuturor documentelor contractuale (bifând căsuța Am citit și sunt de acord cu încheierea contractului de furnizare), documentele procesate în vederea ofertării și contractării vor fi șterse din sistemul informatic în termen de 90 de zile.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ContractReview.propTypes = propTypes;
ContractReview.defaultProps = defaultProps;

const mapStateToProps = state => ({
    docs: getGeneratedDocs(state),
    plan: getCurrentPlan(state),
    session: getSession(state),
    flow: getFlow(state),
});

const mapDispatchToProps = {
    fetchGeneratedDocs,
    setFlow,
    acceptOffer,
    rejectOffer,
    markAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContractReview);
