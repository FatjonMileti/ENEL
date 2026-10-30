import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';
// eslint-disable-next-line
import 'cropperjs/dist/cropper.css';
import 'rc-slider/assets/index.css';
import Scanner from 'components/Scanner';

import { dataURLtoBlob, bytesToMegaBytes } from 'utils';

import * as ocrSelectors from 'store/ocr/selectors';
import * as docsSelectors from 'store/documents/selectors';
import { markAction, setError, clearError } from 'store/client/actions';
import { getSession } from 'store/session/selectors';
import { patch as patchSession } from 'store/session/actions';
import { ocrID, ocrIDMultiple } from 'store/ocr/actions';
import { uploadID, unsetID as unsetDocID, uploadBusinessIdDocs, uploadIDWithSide, uploadAddressCertificate } from 'store/documents/actions';
import { showLoading, hideLoading } from 'store/ui/actions';
import FileService from 'services/file';
import pageService from 'services/page';

import HeaderHero from 'components/heroes/HeaderHero';
import UploadInteraction from 'components/uploadInteraction/UploadInteraction';

import { IMAGES_TOTAL_SIZE_LIMIT_IN_MB } from 'utils/constants/file';

const DOC_TYPES_BUSSINES = ['REGISTRATION_FISC_CERT', 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE'];
const propTypes = {
    ocrID: PropTypes.func.isRequired,
    uploadID: PropTypes.func.isRequired,
    patchSession: PropTypes.func.isRequired,
    markAction: PropTypes.func.isRequired,
};

const defaultProps = {};

class ClientInfoScan extends Component {

    state = {
        step: 0,
        uploadedBusinessDocs: false,
        picture: null,
        angle: 0,
        docs: this.props.docs,
        currentType: null,
        uploadType: null,
        selectedIdType: 'CI',
        idImages: [],
        currentSide: 'FRONT',
        showAddressProof: false,
        addressProofType: null,
        addressProofImages: [],
        addressProofPicture: null
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.markAction(pageService.actions.FOTOGRAFIERE_BULETIN.value);
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    async handleDeleteID() {
        await this.setState({ picture: null });
        await this.props.unsetDocID();
    }

    changeStep(step) {
        this.setState({ step });
    }

    setImage(picture, type = "upload") {
        this.setState({ step: 2 }, () => {
            this.setState({ picture, uploadType: type });
        });
    }

    async handleContinue(e) {
        e.preventDefault();
        this.props.clearError();
        if (this.props.idImg) {
            try {
                this.props.showLoading();
                const doc = dataURLtoBlob(this.props.idImg, 'image/png');
                await this.props.ocrID(doc);
            } catch (error) {
                this.props.hideLoading();
            }
        }
        browserHistory.push(pageService.links['cnp-validation']);
    }

    async handleUpload(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        this.props.showLoading();
        setTimeout(async () => {
            const [image] = await FileService.readImages(file);

            this.setState({ step: 2, picture: image, uploadType: "upload" }, () => {
                this.props.hideLoading();
            });
        }, 250);
    }

    setCropper(c) {
        this.cropper = c;
    }

    setStep(step) {
        this.setState({ step });
    }

    setMobileInput(c) {
        this.mobileInput = c;
    }

    setVariables(variable) {
        this.setState(variable);
    }

    setDocs(docs) {
        this.setState({
            docs: { ...this.state.docs, ...docs },
            uploadType: "upload"
        });
    }

    handleIdTypeChange(e) {
        this.setState({
            selectedIdType: e.target.value,
            idImages: [],
            currentSide: 'FRONT',
            showAddressProof: false,
            addressProofType: null,
            picture: null,
            step: 0
        });
    }

    handleAddressProofTypeChange(type) {
        this.setState({ addressProofType: type });
    }

    async handleAddressProofUpload(e) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        this.props.showLoading();
        setTimeout(async () => {
            const [image] = await FileService.readImages(file);
            this.setState({ addressProofPicture: image }, () => {
                this.props.hideLoading();
            });
        }, 250);
    }

    async handleSubmit(e) {
        e.preventDefault();

        this.props.clearError();
        const { contract_type } = this.props.session;
        const { session } = this.props
        window.dataLayer = window.dataLayer || [];
        const dataLayer = window.dataLayer

        const isStep5sEND = dataLayer.find((data) => data.event === 'online_contract' && data.step === 5);

        if (contract_type === 'b2b' && !this.state.uploadedBusinessDocs) {
            if (this.state.docs['REGISTRATION_FISC_CERT'] && this.state.docs['IMPUTERNICIRE_OR_DOC_CONSTITUIVE']) {
                if (_.isEqual(this.props.docs, this.state.docs)) {
                    pageService.scrollToTop();
                    this.setState({ uploadedBusinessDocs: true, step: 0 });
                } else {
                    try {
                        this.props.showLoading();

                        if (!isStep5sEND) {
                            window.dataLayer.push({
                                'event': 'online_contract',
                                'step': 5,
                                'upload_type': this.state.uploadType === "camera" ? "camera" : "Upload",
                                'document_type': "Ci",
                                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                            });
                        }

                        await this.props.uploadBusinessIdDocs(this.state.docs);

                        pageService.scrollToTop();

                        this.setState({ uploadedBusinessDocs: true, step: 0 });
                        this.props.hideLoading();
                    } catch (e) {
                        const errMsg = 'Documentele nu au putut fi incarcate.';
                        this.props.setError(errMsg);
                        this.props.hideLoading();
                    }
                }
            } else {
                if (!this.state.docs['REGISTRATION_FISC_CERT']) {
                    const errMsg = 'Vă rugăm să atasati certificat de înregistrare fiscală';
                    this.props.setError(errMsg);
                } else if (!this.state.docs['IMPUTERNICIRE_OR_DOC_CONSTITUIVE']) {
                    const errMsg = 'Vă rugăm să atasati împuternicire reprezentant legal';
                    this.props.setError(errMsg);
                }
                pageService.scrollToError();
            }
        } else {
            // Handle CI/CIS/CEI upload flow
            const { selectedIdType, currentSide, idImages, addressProofType, addressProofPicture } = this.state;

            // For CEI, if showing address proof section, handle final submission
            if (selectedIdType === 'CEI') {
                if (addressProofType === 'CERTIFICATE' && !addressProofPicture) {
                    const errMsg = 'Vă rugăm să încărcați certificatul de domiciliu';
                    this.props.setError(errMsg);
                    pageService.scrollToError();
                    return;
                }

                try {
                    this.props.showLoading();

                    // Upload address certificate if provided
                    if (addressProofType === 'CERTIFICATE' && addressProofPicture) {
                        await this.props.uploadAddressCertificate([addressProofPicture]);
                    }
                    // For DECLARATION, backend will handle it based on the flag

                    // Run OCR on both images (front and back)
                    await this.props.ocrIDMultiple(idImages);

                    pageService.scrollToTop();
                    browserHistory.push(pageService.links['cnp-validation']);
                } catch (error) {
                    this.props.hideLoading();
                    const errMsg = 'Documentele nu au putut fi incarcate.';
                    this.props.setError(errMsg);
                    pageService.scrollToError();
                }
                return;
            }

            // For CIS/CEI multi-image upload
            if (selectedIdType === 'CIS' || selectedIdType === 'CEI') {
                if (!this.cropper) {
                    this.props.hideLoading();
                    const errMsg = 'Vă rugăm să atasati documentele de identificare';
                    this.props.setError(errMsg);
                    pageService.scrollToError();
                    return;
                }

                const cropped = this.cropper.getCroppedCanvas().toDataURL();
                const newImages = [...idImages, cropped];

                if (currentSide === 'FRONT') {
                    // First side captured, now capture back
                    this.setState({
                        idImages: newImages,
                        currentSide: 'BACK',
                        picture: null,
                        step: 0
                    });
                    return;
                } else if (currentSide === 'BACK') {
                    // Both sides captured
                    try {
                        if (!isStep5sEND) {
                            window.dataLayer.push({
                                'event': 'online_contract',
                                'step': 5,
                                'upload_type': this.state.uploadType === "camera" ? "camera" : "Upload",
                                'document_type': selectedIdType,
                                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                            });
                        }

                        this.props.showLoading();

                        // Upload both images with side parameter
                        await this.props.uploadIDWithSide(newImages, selectedIdType);

                        if (selectedIdType === 'CIS') {
                            // For CIS, run OCR on both images and continue
                            await this.props.ocrIDMultiple(newImages);

                            pageService.scrollToTop();
                            browserHistory.push(pageService.links['cnp-validation']);
                        } else if (selectedIdType === 'CEI') {
                            // For CEI, show address proof section
                            this.props.hideLoading();
                            this.setState({
                                idImages: newImages,
                                showAddressProof: true,
                                step: 0,
                                picture: null
                            });
                            pageService.scrollToTop();
                        }
                    } catch (error) {
                        this.props.hideLoading();
                        const errMsg = 'Documentele nu au putut fi incarcate.';
                        this.props.setError(errMsg);
                        pageService.scrollToError();
                    }
                    return;
                }
            }

            // Standard CI flow (existing functionality)
            if (!isStep5sEND) {
                window.dataLayer.push({
                    'event': 'online_contract',
                    'step': 5,
                    'upload_type': this.state.uploadType === "camera" ? "camera" : "Upload",
                    'document_type': "CI",
                    'client_type': session.contract_type === "b2c" ? "residential" : "business",
                    'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
                });
            }

            this.props.showLoading();
            setTimeout(async () => {
                if (!this.props.idImg) {
                    if (this.cropper) {
                        const cropped = this.cropper.getCroppedCanvas().toDataURL();
                        const doc = dataURLtoBlob(cropped, 'image/png');
                        await this.props.uploadID(cropped);
                        await this.props.ocrID(doc);
                    } else {
                        this.props.hideLoading();
                        const errMsg = 'Vă rugăm să atasati documentele de identificare';
                        this.props.setError(errMsg);
                        pageService.scrollToError();
                        return;
                    }
                }

                pageService.scrollToTop();
                browserHistory.push(pageService.links['cnp-validation']);
            }, 250);
        }
    }

    handleAdd(e, docType, title) {
        e.preventDefault();
        this.props.clearError();
        const image = this.cropper.getCroppedCanvas().toDataURL();
        const docs = _.extend({}, this.state.docs);

        // check size limit
        const alreadyUploadedImagesOfThisType =
            (this.state.docs[docType] && this.state.docs[docType].images) ||
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
            const errMsg = 'Dimensiunea fisierului depaseste 10MB.';
            this.props.setError(errMsg);

            this.setState({
                step: 0,
                picture: null,
                angle: 0,
                docs,
            });

            return;
        }
        // check size limit /

        if (docs[docType] && docs[docType].asMutable) docs[docType] = docs[docType].asMutable();
        if (docs[docType] && docs[docType].images.asMutable) docs[docType].images = docs[docType].images.asMutable();

        if (!docs[docType]) {
            docs[docType] = {
                tip: docType,
                title: title || docType,
                nr: null,
                images: [],
            };
        }

        docs[docType].images.push(image);

        this.setState({
            step: 0,
            picture: null,
            angle: 0,
            docs,
        });
    }

    render() {
        const { contract_type } = this.props.session;
        if (this.state.step === 1) {
            return contract_type === 'b2b' ? (
                <Scanner
                    title="Fotografiază documentul"
                    format="a4"
                    onBack={() => this.changeStep(0)}
                    onPicture={image => this.setImage(image, "camera")}
                />
            ) : (
                <Scanner
                    title="Fotografiază cartea de identitate"
                    format="ci"
                    onBack={() => this.changeStep(0)}
                    onPicture={image => this.setImage(image, "camera")}
                    handleUpload={this.handleUpload}
                />
            );
        }

        console.log({ state: this.state });

        return (
            <div>
                <HeaderHero
                    title="Datele tale de identificare"
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                {contract_type === 'b2b' && !this.state.uploadedBusinessDocs ? (
                    <Fragment>
                        <div className="page-description">
                            <div className="container main-area">
                                Te rugăm să încarci documentele necesare pentru identificarea societății. Poți alege una
                                din opțiunile de mai jos pentru a fotografia sau încărca o imagine.
                            </div>
                        </div>

                        <UploadInteraction
                            step={this.state.step}
                            docs={this.state.docs}
                            picture={this.state.picture}
                            angle={this.state.angle}
                            handleAdd={this.handleAdd}
                            setCropper={this.setCropper}
                            setStep={this.setStep}
                            mobileInput={this.mobileInput}
                            handleSubmit={this.handleSubmit}
                            showLoading={this.props.showLoading}
                            hideLoading={this.props.hideLoading}
                            // docType={this.state.form.tip}
                            setError={this.props.setError}
                            // valabilitate={this.state.form.valabilitate}
                            setVariables={this.setVariables}
                            overlayText={<span>Ai terminat de încărcat<br />toate documentele<br />necesare?</span>}
                            docTypes={DOC_TYPES_BUSSINES}
                            setDocs={this.setDocs}
                            currentType={this.state.currentType}
                        />
                    </Fragment>
                ) : (
                    <Fragment>
                        {/* ID Type Selection */}
                        {!this.state.showAddressProof && this.state.step === 0 && this.state.idImages.length === 0 && !this.props.idImg && (
                            <div className="page-description main-content">
                                <div className="container">
                                    <h5 className="mb-4">Selectează tipul cărții de identitate</h5>
                                    <div className="form-group">
                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="idType"
                                                id="idTypeCI"
                                                value="CI"
                                                checked={this.state.selectedIdType === 'CI'}
                                                onChange={this.handleIdTypeChange}
                                            />
                                            <label className="form-check-label" htmlFor="idTypeCI">
                                                Carte de identitate standard / Pașaport
                                            </label>
                                        </div>
                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="idType"
                                                id="idTypeCIS"
                                                value="CIS"
                                                checked={this.state.selectedIdType === 'CIS'}
                                                onChange={this.handleIdTypeChange}
                                            />
                                            <label className="form-check-label" htmlFor="idTypeCIS">
                                                Carte de identitate format nou ( fără CIP )
                                            </label>
                                        </div>
                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="idType"
                                                id="idTypeCEI"
                                                value="CEI"
                                                checked={this.state.selectedIdType === 'CEI'}
                                                onChange={this.handleIdTypeChange}
                                            />
                                            <label className="form-check-label" htmlFor="idTypeCEI">
                                                Carte de identitate format nou ( cu CIP )
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Display uploaded ID images for CEI with address proof section */}
                        {this.state.selectedIdType === 'CIS' && this.state.idImages.length === 2 && (
                            <div className="main-content">
                                <div className="container">
                                    <div className="page-description mb-2">
                                        <h5>Carte de identitate format nou ( fără CIP ) încărcată</h5>
                                    </div>

                                    {/* Display both ID images */}
                                    <div className="row mb-2">
                                        <div className="col-md-6 mb-3">
                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">Partea din față</h6>
                                                    <img
                                                        src={this.state.idImages[0]}
                                                        alt="Partea din față"
                                                        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">Partea din spate</h6>
                                                    <img
                                                        src={this.state.idImages[1]}
                                                        alt="Partea din spate"
                                                        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-5 pb-5">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ minWidth: '250px', padding: '15px 50px', fontSize: '16px' }}
                                            onClick={this.handleSubmit}
                                        >
                                            Continuă
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Display uploaded ID images for CEI with address proof section */}
                        {this.state.showAddressProof && this.state.selectedIdType === 'CEI' && this.state.idImages.length === 2 && (
                            <div className="main-content">
                                <div className="container">
                                    <div className="page-description mb-2">
                                        <h5>Cartea de identitate încărcată</h5>
                                    </div>

                                    {/* Display both ID images */}
                                    <div className="row mb-2">
                                        <div className="col-md-6 mb-3">
                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">Partea din față</h6>
                                                    <img
                                                        src={this.state.idImages[0]}
                                                        alt="Partea din față"
                                                        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">Partea din spate</h6>
                                                    <img
                                                        src={this.state.idImages[1]}
                                                        alt="Partea din spate"
                                                        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Proof Section */}
                                    <div className="page-description mb-1">
                                        <h5>Încarcă document atestare domiciliu sau optează pentru Declarația pe proprie răspundere</h5>
                                    </div>

                                    <div className="mb-1">
                                        <h6 className="mb-1">DOCUMENT ATESTARE ADRESA DOMICILIU</h6>

                                        {this.state.addressProofPicture && (
                                            <div className="mb-3">
                                                <img
                                                    src={this.state.addressProofPicture}
                                                    alt="Certificat domiciliu"
                                                    style={{ maxWidth: '300px', height: 'auto', border: '1px solid #ddd' }}
                                                />
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <input
                                                type="file"
                                                id="addressProofUpload"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={this.handleAddressProofUpload}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    document.getElementById('addressProofUpload').click();
                                                    this.handleAddressProofTypeChange('CERTIFICATE');
                                                }}
                                            >
                                                {this.state.addressProofPicture ? 'Încarcă din nou' : 'Încarcă document'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center mb-5 pb-5">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            style={{ minWidth: '250px', padding: '15px 50px', fontSize: '16px' }}
                                            onClick={this.handleSubmit}
                                        >
                                            Continuă
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Section */}
                        {!this.state.showAddressProof && (
                            <Fragment>
                                <div className="page-description main-content">
                                    {this.state.step === 0 && <div className="hide-mobile">
                                        {(this.state.selectedIdType === 'CIS' || this.state.selectedIdType === 'CEI') && this.state.currentSide === 'FRONT'
                                            ? 'Te rugăm să alegi una din opțiunile de mai jos pentru a fotografia sau încărca partea din față a actului de identitate.'
                                            : (this.state.selectedIdType === 'CIS' || this.state.selectedIdType === 'CEI') && this.state.currentSide === 'BACK'
                                                ? 'Te rugăm să alegi una din opțiunile de mai jos pentru a fotografia sau încărca partea din spate a actului de identitate.'
                                                : 'Te rugăm să alegi una din opțiunile de mai jos pentru a fotografia sau încărca o imagine a actului de identitate.'
                                        }
                                    </div>}
                                    {this.state.step === 0 && <div className="show-mobile">
                                        {(this.state.selectedIdType === 'CIS' || this.state.selectedIdType === 'CEI') && this.state.currentSide === 'FRONT'
                                            ? 'Te rugăm să fotografiezi sau să încarci partea din față a actului de identitate.'
                                            : (this.state.selectedIdType === 'CIS' || this.state.selectedIdType === 'CEI') && this.state.currentSide === 'BACK'
                                                ? 'Te rugăm să fotografiezi sau să încarci partea din spate a actului de identitate.'
                                                : 'Te rugăm să fotografiezi sau să încarci o imagine a actului de identitate.'
                                        }
                                    </div>}
                                    {this.state.step === 2 && <div className="">
                                        Încadrează în chenar actul de identitate.
                                    </div>}
                                </div>
                                <div className="bottom-margin" >
                                    <div className="row">
                                        <div className="col">
                                            <UploadInteraction
                                                step={this.state.step}
                                                handleUpload={this.handleUpload}
                                                docs={
                                                    this.props.idImg || (this.state.idImages.length > 0 && this.state.currentSide === 'BACK') ? {
                                                        id: {
                                                            title: 'Actul de identitate',
                                                            images: this.state.idImages.length > 0 ? [this.state.idImages[0]] : [this.props.idImg],
                                                        },
                                                    } : {}}
                                                handleDelete={this.handleDeleteID}
                                                handleContinue={this.handleContinue}
                                                cropper={this.cropper}
                                                handleAdd={this.handleSubmit}
                                                picture={this.state.picture}
                                                angle={this.state.angle}
                                                docType="CI"
                                                handleSubmit={this.handleSubmit}
                                                setCropper={this.setCropper}
                                                setStep={this.setStep}
                                                setError={this.props.setError}
                                                clearError={this.props.clearError}
                                                setVariables={this.setVariables}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        )}
                    </Fragment>
                )}
            </div>
        );
    }
}

ClientInfoScan.propTypes = propTypes;
ClientInfoScan.defaultProps = defaultProps;

const mapStateToProps = state => ({
    ID: ocrSelectors.getId(state),
    idImg: docsSelectors.getID(state),
    session: getSession(state),
    docs: docsSelectors.getBusinessIdDocs(state),
});

const mapDispatchToProps = {
    ocrID,
    ocrIDMultiple,
    uploadID,
    uploadIDWithSide,
    uploadAddressCertificate,
    patchSession,
    showLoading,
    hideLoading,
    unsetDocID,
    markAction,
    setError,
    clearError,
    uploadBusinessIdDocs,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientInfoScan);
