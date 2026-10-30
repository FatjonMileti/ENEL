/* eslint-disable react/no-unused-prop-types */
import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import Cropper from 'react-cropper';
// eslint-disable-next-line
import 'cropperjs/dist/cropper.css';

import 'rc-slider/assets/index.css';
import Scanner from 'components/Scanner';

import ocrService from 'services/ocr';
import { ocrInvoice } from 'store/ocr/actions';
import { uploadInvoice } from 'store/documents/actions';
import { fetchItems as fetchProviders } from 'store/providers/actions';
import { patch as patchSession } from 'store/session/actions';
import { showLoading, hideLoading } from '../../store/ui/actions';
import { updateRegistrationInfo } from 'store/registration/actions';
import * as providersSelectors from 'store/providers/selectors';
import * as ocrSelectors from 'store/ocr/selectors';
import { getSession } from 'store/session/selectors';
import { getFlow } from 'store/client/selectors';
import { markAction, setError, clearError } from 'store/client/actions';
import { getInvoice as getDocInvoice, getInvoicePDF, getID } from 'store/documents/selectors';
import { getRegistrationNumber } from 'store/registration/selectors';

import Form from 'components/validation/form';
import HeaderHero from 'components/heroes/HeaderHero';
import pageService from 'services/page';

import { dataURLtoBlob, bytesToMegaBytes } from 'utils';
import { toRegistrationPostData } from 'utils/serializers';

import UploadInteraction from 'components/uploadInteraction/UploadInteraction';

import './ClientInvoiceScan.scss';

const propTypes = {
    session: PropTypes.object,
    eeProviders: PropTypes.array,
    gazProviders: PropTypes.array,
    flow: PropTypes.string,
    ocrInvoice: PropTypes.func.isRequired,
    fetchProviders: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {
    session: {},
    eeProviders: [],
    gazProviders: [],
    flow: '',
};

const DOC_TYPE = 'Factura';
const IMAGES_TOTAL_SIZE_LIMIT_IN_MB = 10;

class ClientInvoiceScan extends Component {

    form = {
        furnizor_id: '',
    };

    state = {
        step: 0,
        picture: null,
        angle: 0,
        form: this.form,
        docs: {},
        pdf: this.props.pdfInvoice,
        uploadType: null
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.fetchProviders();
        if (_.size(this.props.docInvoice)) {
            this.setState({ docs: { [DOC_TYPE]: { images: this.props.docInvoice } } });
        }

        this.props.markAction(pageService.actions.FOTO_FACTURA.value);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.session[`${this.props.flow}_furnizor_actual`] && !this.state.form.furnizor_id) {
            this.setState({
                form: _.extend(this.state.form, {
                    furnizor_id: nextProps.session[`${this.props.flow}_furnizor_actual`],
                }),
            });
        }
    }

    resetState() {
        this.setState({
            step: 0,
            picture: null,
            angle: 0,
        });
    }

    changeStep(step) {
        this.setState({ step });
    }

    setImage(picture) {
        this.setState({ step: 2 }, () => {
            this.setState({ picture, uploadType:"camera" });
        });
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleAdd(e) {
        e.preventDefault();
        this.props.clearError();
        const image = this.cropper.getCroppedCanvas().toDataURL();
        const docs = _.extend({}, this.state.docs);
        const type = DOC_TYPE;

        // check size limit
        const alreadyUploadedImagesOfThisType =
            (this.state.docs[DOC_TYPE] && this.state.docs[DOC_TYPE].images) ||
            [];

        const alreadyUploadedImagesOfThisTypeSize =
            alreadyUploadedImagesOfThisType.reduce(
                (acc, image) => acc + dataURLtoBlob(image).size,
                0
            );

        const newImageSize = dataURLtoBlob(image).size;

        const total = bytesToMegaBytes(
            alreadyUploadedImagesOfThisTypeSize + newImageSize
        );

        if (total > IMAGES_TOTAL_SIZE_LIMIT_IN_MB) {
            this.props.hideLoading();
            this.props.setError('Dimensiunea fisierului depaseste 10MB.');

            this.setState({
                step: 0,
                picture: null,
                angle: 0,
                pdf: null,
            });

            return;
        }
        // check size limit /

        if (docs[type] && docs[type].asMutable) docs[type] = docs[type].asMutable();
        if (docs[type] && docs[type].images.asMutable) docs[type].images = docs[type].images.asMutable();

        if (!docs[type]) {
            docs[type] = {
                tip: type,
                title: type,
                valabilitate: this.state.form.valabilitate,
                nr: null,
                images: [],
            };
        }

        docs[type].images.push(image);

        this.setState({
            step: 0,
            picture: null,
            angle: 0,
            pdf: null,
            docs,
        });
    }

    async handleSubmit(e) {

        e.preventDefault();


        if (_.size(this.state.docs)) {
            const type = _.first(_.keys(this.state.docs));
            const provider = _.find(this.props[`${this.props.flow}Providers`], item => item.internal_id == this.state.form.furnizor_id);

            const {session} = this.props

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'online_contract',
                'step': 8,
                'current_provider': provider ?  provider.denumire : "",
                'upload_type': this.state.uploadType === "camera" ? "camera" : "upload",
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });

            if (_.size(this.state.docs[type].images)) {
                this.props.showLoading();
                if (!_.isEqual(this.state.docs[type].images, this.props.docInvoice)) {
                    try {
                        await this.props.uploadInvoice(this.state.docs[type].images, this.state.pdf);
                    } catch (error) {
                        this.props.hideLoading();
                    }
                }
                if (ocrService.hasProviderOCR(provider)) {
                    await this.props.ocrInvoice(this.state.docs[type].images, this.state.pdf, ocrService.getProviderOCR(provider));
                    await this.props.patchSession({
                        _loc: {
                            nlc: '',
                            judet: '',
                            localitate: '',
                            tip_artera: '',
                            strada: '',
                            nr_strada: '',
                            bloc: '',
                            scara: '',
                            apartament: '',
                            etaj: '',
                            cod_postal: '',
                        },
                    });
                }
                this.props.hideLoading();
            }
        }
        await this.props.updateRegistrationInfo(
            toRegistrationPostData({}, this.props),
            this.props.registrationNumber
        );

        pageService.scrollToTop();
        browserHistory.push(pageService.links['nlc-validation']);

    }

    handleProviderChange(e) {
        this.setState({
            form: _.extend(this.state.form, {
                furnizor_id: e.target.value ? parseInt(e.target.value) : '',
            }),
        });
    }

    renderProviders() {
        const providers = _.map(this.props[`${this.props.flow}Providers`], v => ({ value: v.internal_id, label: v.denumire }));

        if (this.state.form.furnizor_id !== '') {
            return (
                <div className="main-content"  >
                    <Form>
                        <div className="row client-autocomplete">
                            <div className="mb-3 col-md-12">
                                <label>Furnizor</label>
                                <select
                                    name="furnizor_id"
                                    label="Care este furnizorul tău actual?"
                                    placeholder="Alege"
                                    value={this.state.form.furnizor_id}
                                    className="form-control"
                                    disabled
                                >
                                    {_.map(providers, provider => (
                                        <option key={provider.value} value={provider.value}>{provider.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Form>
                </div>
            );
        }
    }

    setCropper(c) {
        this.cropper = c;
    }

    setVariables(variable) {
        this.setState(variable);
    }

    setMobileInput(c) {
        this.mobileInput = c;
    }

    render() {
        if (this.state.step === 1) {
            return (
                <Scanner
                    title="Fotografiază factura"
                    format="a4"
                    onBack={() => this.changeStep(0)}
                    onPicture={image => this.setImage(image)}
                />
            );
        }

        return (
            <div className="ClientInvoiceScan">
                <HeaderHero
                    title="Datele locului de consum"
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                <div className="main-content">
                    {this.state.step === 0 && <div className=" hide-mobile">
                        Te rugăm să alegi una din opțiunile de mai jos pentru a fotografia sau încărca o imagine a facturii de utilități.
                    </div>}
                    {this.state.step === 0 && <div className="page-description main-area show-mobile">
                        Te rugăm să fotografiezi sau să încarci o imagine a facturii de utilități.
                    </div>}
                    {this.state.step === 2 && <div className="page-description main-area">
                        Încadrează în chenar factura de furnizare.
                    </div>}
                </div>

                {this.renderProviders()}
                <div className='bottom-margin'>
                    <UploadInteraction
                        step={this.state.step}
                        docs={this.state.docs}
                        cropper={this.cropper}
                        picture={this.state.picture}
                        angle={this.state.angle}
                        handleAdd={this.handleAdd}
                        setCropper={this.setCropper}
                        setStep={this.setStep}
                        setMobileInput={this.setMobileInput}
                        mobileInput={this.mobileInput}
                        handleSubmit={this.handleSubmit}
                        showLoading={this.props.showLoading}
                        hideLoading={this.props.hideLoading}
                        docType={DOC_TYPE}
                        setError={this.props.setError}
                        clearError={this.props.clearError}
                        shouldReadPdf
                        valabilitate={this.state.form.valabilitate}
                        pdf={this.state.pdf}
                        setVariables={this.setVariables}
                        overlayText={<span>Ai terminat de încărcat<br />toate paginile facturii?</span>}
                    />
                </div>

            </div>
        );
    }
}

ClientInvoiceScan.propTypes = propTypes;
ClientInvoiceScan.defaultProps = defaultProps;

const mapStateToProps = state => ({
    eeProviders: providersSelectors.getItems(state, 'ee'),
    gazProviders: providersSelectors.getItems(state, 'gaz'),
    session: getSession(state),
    flow: getFlow(state).toLowerCase(),
    docInvoice: getDocInvoice(state),
    pdfInvoice: getInvoicePDF(state),
    registrationNumber: getRegistrationNumber(state),
});

const mapDispatchToProps = {
    ocrInvoice,
    uploadInvoice,
    fetchProviders,
    patchSession,
    showLoading,
    hideLoading,
    markAction,
    setError,
    clearError,
    updateRegistrationInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientInvoiceScan);
