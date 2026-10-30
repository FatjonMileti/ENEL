import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';

import moment from 'moment';
import _ from 'lodash';

import Button from 'components/Button';
import FormErrors from 'components/FormErrors';
import { getGeneratedDocs } from 'store/documents/selectors';
import { getSession } from 'store/session/selectors';
import { acceptOffer, rejectOffer, patch as patchSession } from 'store/session/actions';
import ModalOverlay from 'components/overlays/ModalOverlay';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';

import './GeneratedDocList.scss';

const propTypes = {
    docs: PropTypes.array.isRequired,
    acceptOffer: PropTypes.func.isRequired,
    rejectOffer: PropTypes.func.isRequired,
};
const defaultProps = {};

class GeneratedDocList extends Component {
    formErrors = {
        accept: [],
    };

    state = {
        accepted: false,
        acceptedEBill: false,
        showedModalAgreement: false,
        showAgreementOverlay: false,
        flow: null,
        formErrors: this.formErrors,
        postInvoice: false,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate() {
        const { session } = this.props;
        if (!_.isEmpty(session) && !this.state.flow) {
            if (session.type == 'COMBO') {
                this.setState({ flow: 'ee' });
            } else {
                this.setState({ flow: session.type.toLowerCase() });
            }
            const flow = session.type.toLowerCase();

            if (session[`${flow}_factura`].mod_corespondenta == 'MAIL') {
            } else if (session[`${flow}_factura`].mod_corespondenta == 'SMS') {
            } else {
                this.setState({
                    postInvoice: true,
                });
            }
        }
    }

    getDocTitle = doc => {
        return (doc.type || '').replace('.pdf', '');
    };

    getDownloadAllURL = () => {
        const ZIP_NAME = 'Documente.zip';
        const { docs } = this.props;
        const { flow } = this.state;
        if (flow && docs && docs[flow].length) {
            const { url } = docs[flow][0];
            const docName = url.match(/.*\/(.*)\?.*/)[1];

            return url.replace(docName, ZIP_NAME);
        }

        return '#';
    };

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

    validateAccepted() {
        const { formErrors } = this.state;

        if (!this.state.accepted) {
            formErrors.accept.push(
                'Trebuie sa fiți de acord cu încheierea contractului de furnizare.'
            );
            this.setState({
                formErrors,
            });
        }
    }

    validateAcceptedEBill() {
        const { formErrors } = this.state;

        if (!this.state.acceptedEBill && !this.state.postInvoice) {
            this.setState({
                showAgreementOverlay: true,
            });
        }
    }

    handleAcceptChange() {
        this.setState({ accepted: !this.state.accepted });
    }

    handleAcceptEBillChange() {
        this.setState({ acceptedEBill: !this.state.acceptedEBill });
    }

    async handleAcceptClick() {
        const { session } = this.props;
        const { flow } = this.state;

        this.resetFormErrors();
        this.validateAccepted();
        this.validateAcceptedEBill();
        if (this.noFormErrors() && (this.state.acceptedEBill || this.state.postInvoice)) {
            session[`${flow}_factura`]['bill_type_accepted'] = this.state.acceptedEBill;
            if (this.state.postInvoice) {
                session[`${flow}_factura`]['mod_corespondenta'] = 'POSTA';
                session[`${flow}_factura`]['email'] = '';
                session[`${flow}_factura`]['telefon_mobil'] = '';
            }
            await this.props.patchSession(session);
            await this.props.acceptOffer(flow);

            if (session.type == 'COMBO') {
                if ((flow == 'ee' && session.gaz_agree) || (flow == 'gaz' && session.ee_agree)) {
                    window.location =
                        'https://www.ppcenergy.ro/confirmare/contract-rapid-confirmare-contract';
                } else {
                    window.location.reload();
                }
            } else {
                window.location =
                    'https://www.ppcenergy.ro/confirmare/contract-rapid-confirmare-contract';
            }
        }
    }

    async handleRejectClick() {
        await this.props.rejectOffer(this.state.flow);
        window.location = 'https://www.ppcenergy.ro';
    }

    handleTabClick(flow) {
        this.setState({ flow });
    }

    renderFormErrors(section) {
        if (this.state.formErrors[section].length > 0) {
            return <FormErrors errors={this.state.formErrors[section]} />;
        }
    }

    renderComboTabs() {
        const { session } = this.props;
        if (session.type == 'COMBO') {
            return (
                <div className="combo-tabs">
                    <span
                        className={`combo-tab ${this.state.flow == 'ee' ? 'active' : ''}`}
                        onClick={() => this.handleTabClick('ee')}
                    >
                        Electricitate
                    </span>
                    <span className="separator">/</span>
                    <span
                        className={`combo-tab ${this.state.flow == 'gaz' ? 'active' : ''}`}
                        onClick={() => this.handleTabClick('gaz')}
                    >
                        Gaze Naturale
                    </span>
                </div>
            );
        }
    }

    handleAcceptEBillDismiss() {
        this.setState({
            showAgreementOverlay: false,
            showedModalAgreement: true,
            acceptedEBill: true,
        });
    }

    handleIgnoreEBillDismiss() {
        this.setState({
            showAgreementOverlay: false,
            showedModalAgreement: true,
            postInvoice: true,
        });
    }

    renderDocs() {
        const { docs } = this.props;
        const { flow } = this.state;
        if (flow && !_.isEmpty(docs[flow])) {
            return _.map(docs[flow], doc => (
                <div key={_.uniqueId()} className="card card-serv">
                    <a href={doc.url} target="_blank" className="card-body">
                        <h4 className="card-title">
                            Document <span className="separator">|</span>{' '}
                            {moment().format('DD MMM YYYY')}
                        </h4>
                        <p className="card-text">{this.getDocTitle(doc)}</p>
                        <div className="doc-type hide-mobile">PDF ({doc.size})</div>
                        <Button secondary outline className="hide-mobile" value="Descarcă" />
                    </a>
                </div>
            ));
        }
    }

    getAgreementEBillContent() {
        return (
            <Fragment>
                <div>
                    Grija pentru mediu este o preocupare pentru noi. Mai putine facturi printate,
                    mai mult aer curat pentru noi toti. Factura electronica este un serviciu 100%
                    gratuit si iti ofera mai multa flexibilitate. Fii alaturi de noi, prin
                    acceptarea transmiterii facturii in format electronic. Exprima-ti acordul prin
                    bifa de mai jos.
                </div>
            </Fragment>
        );
    }

    renderAcceptSection() {
        const { session } = this.props;
        const flow = session.ee_serviciu ? 'ee' : 'gaz';
        let type = 'posta';
        let contact = '';

        if (session[`${flow}_factura`].mod_corespondenta == 'MAIL') {
            type = 'email:';
            contact = session[`${flow}_factura`].email;
        } else if (session[`${flow}_factura`].mod_corespondenta == 'SMS') {
            type = 'SMS: ';
            contact = session[`${flow}_factura`].telefon_mobil;
        }

        if (flow && !_.isBoolean(session[`${flow}_agree`])) {
            return (
                <Fragment>
                    {this.renderFormErrors('accept')}
                    <div className="agreement spaced-top">
                        <div className="custom-control custom-checkbox">
                            <input
                                type="checkbox"
                                className="custom-control-input"
                                id="accept-email"
                                checked={this.state.accepted}
                                onChange={this.handleAcceptChange}
                            />
                            <label className="custom-control-label" htmlFor="accept-email">
                                Am citit și sunt de acord cu încheierea contractului de furnizare*
                            </label>
                        </div>
                    </div>
                    {!this.state.postInvoice ? (
                        <div className="agreement">
                            <div className="custom-control custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="accept-ebill"
                                    checked={this.state.acceptedEBill}
                                    onChange={this.handleAcceptEBillChange}
                                />
                                <label className="custom-control-label" htmlFor="accept-ebill">
                                    Am citit si sunt de acord cu modalitatea de transmitere a
                                    facturii electronice prin {type} {contact} (
                                    <a
                                        target="_blank"
                                        href="https://www.ppcenergy.ro/servicii-digitale/activare-factura-electronica"
                                    >
                                        Termeni si conditii privind transmiterea corespondentei si
                                        facturii PPC
                                    </a>
                                    )
                                </label>
                            </div>
                        </div>
                    ) : (
                        ''
                    )}
                    <div className="text-center spaced-top">
                        <Button
                            primary
                            underline
                            value="Nu sunt de acord"
                            onClick={this.handleRejectClick}
                        />
                        <Button primary value="Sunt de acord" onClick={this.handleAcceptClick} />
                    </div>
                </Fragment>
            );
        }
    }

    render() {
        return (
            <div>
                <Fragment>
                    <ModalOverlay
                        show={this.state.showAgreementOverlay}
                        onClose={this.handleIgnoreEBillDismiss}
                    >
                        <ConfirmOverlay
                            title=""
                            description={this.getAgreementEBillContent()}
                            confirmLabel="Accepta"
                            onConfirm={this.handleAcceptEBillDismiss}
                            onDismiss={this.handleIgnoreEBillDismiss}
                            dismissLabel="Ignora"
                            noLogo
                            noFixed
                            show
                            big
                        />
                    </ModalOverlay>
                </Fragment>
                <div className="GeneratedDocList">
                    <div className="row">
                        <div className="col-12">
                            <div className="card-set set-electricitat">
                                {this.renderComboTabs()}
                                {this.renderDocs()}
                                <a href={this.getDownloadAllURL()} target="_blank">
                                    <Button
                                        secondary
                                        outline
                                        className="btn-full-mobile btn-download-all"
                                        value="Descarcă toate documentele"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                    {this.renderAcceptSection()}
                    <div className="spaced-top">
                        <br />
                        <p className="disclaimer">
                            <span className="disclaimer-star">*</span>Acceptarea contractului
                            implică o obligație viitoare de plata a facturilor emise. <br />
                            După acceptare documentelor contractuale, ele vor fi disponibile pentru
                            descărcare timp de 90 de zile.
                        </p>
                        <p className="disclaimer">
                            În cazul în care contractul de furnizare a energiei electrice/gazelor
                            naturale nu este finalizat, prin acceptarea tuturor documentelor
                            contractuale (bifând căsuța Am citit și sunt de acord cu încheierea
                            contractului de furnizare), documentele procesate în vederea ofertării
                            și contractării vor fi șterse din sistemul informatic PPC în termen de
                            90 de zile.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

GeneratedDocList.propTypes = propTypes;
GeneratedDocList.defaultProps = defaultProps;

const mapStateToProps = state => ({
    docs: getGeneratedDocs(state),
    session: getSession(state),
});

const mapDispatchToProps = {
    acceptOffer,
    rejectOffer,
    patchSession,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GeneratedDocList);
