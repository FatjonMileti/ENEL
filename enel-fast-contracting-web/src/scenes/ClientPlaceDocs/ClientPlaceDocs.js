import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';

import Cropper from 'react-cropper';
// eslint-disable-next-line
import 'cropperjs/dist/cropper.css';

import { getSession } from 'store/session/selectors';

import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import Scanner from 'components/Scanner';
import DocList from 'components/DocList';
import FileService from 'services/file';
import { patch as patchSession } from 'store/session/actions';
import { uploadOwnerDocs } from 'store/documents/actions';
import { getOwnerDocs } from 'store/documents/selectors';
import { getFlow, getNLC, getOptions as getClientOptions } from 'store/client/selectors';
import { markAction, setError, clearError } from 'store/client/actions';
import { hideLoading, showLoading } from '../../store/ui/actions';

import Form from 'components/validation/form';
import Input from 'components/validation/input';
import Select from 'components/validation/select';
import Button from 'components/validation/button';
import FormErrors from 'components/FormErrors';
import HeaderHero from 'components/heroes/HeaderHero';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import ModalOverlay from 'components/overlays/ModalOverlay';
import { laterThanDays, laterThanToday, maxLength, month, required } from 'components/validation/rules';
import pageService from 'services/page';

import { bytesToMegaBytes, dataURLtoBlob } from 'utils';

import './ClientPlaceDocs.scss';
import offerService from 'services/offer';
import { getItems } from 'store/counties/selectors';

const TYPES = {
    ACT_PROPRIETAR: 'Act spaţiu',
    CER: 'Certificat Racordare',
    ATR: 'Aviz Tehnic de Racordare',
    DOC_ACORD_ACCES: 'Acord Acces',
    ALTELE: 'Alte Documente',
};

const propTypes = {
    patchSession: PropTypes.func.isRequired,
    uploadOwnerDocs: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    flow: PropTypes.string,
    markAction: PropTypes.func.isRequired,
    session: PropTypes.object,
};

const defaultProps = {
    flow: '',
};

const IMAGES_TOTAL_SIZE_LIMIT_IN_MB = 9.5;

class ClientPlaceDocs extends Component {

    form = {
        tip: 'ACT_PROPRIETAR',
        valabilitate: null,
        declaratie_act_spatiu: this.props.session && this.props.session[`${this.props.flow}_loc`].declaratie_act_spatiu ? this.props.session[`${this.props.flow}_loc`].declaratie_act_spatiu : false,
        ownership_valabilitate: this.props.session && this.props.session[`${this.props.flow}_loc`].ownership_valabilitate ? this.props.session[`${this.props.flow}_loc`].ownership_valabilitate : moment(new Date(), 'YYYY-MM-DD').add(12, 'months').format('YYYY-MM-DD'),
        ownership_role: this.props.session && this.props.session[`${this.props.flow}_loc`].ownership_role ? this.props.session[`${this.props.flow}_loc`].ownership_role : 'proprietar',
        ownership_role_desc: this.props.session && this.props.session[`${this.props.flow}_loc`].ownership_role_desc,
        ownership_role_start_date: this.props.session && this.props.session[`${this.props.flow}_loc`].ownership_role_start_date,

    };

    formErrors = {
        docs: [],
    };

    getCurrentProvider() {
        const providerId = this.props.session[`${this.props.flow}_furnizor_actual`] || this.props.nlc.supplyerId;
        return _.find(this.props[`${this.props.flow}Providers`], item => item.internal_id == providerId);
    }

    provider = this.getCurrentProvider();
    county = _.find(this.props.counties, item => item.denumire === this.props.session.judet);
    isEnelCounty = !_.isNil(this.county) && this.county.distribution.distributie_enel === 'D';

    options = {
        flow: this.props.flow,
        nlc: this.props.nlc.status,
        isEnelCounty: this.isEnelCounty,
        activeContract: this.props.clientOptions[`${this.props.flow}_are_furnizare_activa`],
        provider: this.provider ? this.provider.denumire : null,
    };

    state = {
        step: 0,
        picture: null,
        angle: 0,
        form: this.form,
        docs: this.props.docs,
        showDate: false,
        formErrors: this.formErrors,
        showModalOverlay: false,
        schimba_furnizor: offerService.getProviderChange(this.options),
        supply: this.props.session && this.props.session[`${this.props.flow}_are_furnizare_activa`],
        schimba_titular: this.props.session && this.props.session[`${this.props.flow}_schimba_titular`],
        customerRoles: [
            { value: 'proprietar', label: 'Proprietar' },
            { value: 'coproprietar', label: 'Coproprietar' },
            {
                value: 'uzufructuar/beneficiar al dreptului de abitatie',
                label: 'Uzufructuar/Beneficiar al dreptului de abitatie',
            },
            { value: 'chirias/comodatar', label: 'Chirias/Comodatar' },
            { value: 'unic mostenitor', label: 'Unic mostenitor' },
            { value: 'comostenitor', label: 'Comostenitor' },
            { value: 'sot supravietuitor', label: 'Sot supravietuitor' },
            { value: 'fara acte', label: 'Fara acte' },
            { value: 'alte cazuri', label: 'Alte cazuri' },
        ],
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    enableCam(e) {
        e.preventDefault();
        this.setState({ step: 1 });
    }

    componentDidMount() {
        this.props.markAction(pageService.actions.FOTO_ACT_SPATIU.value);
    }

    changeStep(step) {
        this.setState({ step });
    }

    rotatePicture(value) {
        this.setState({ angle: value });
    }

    setImage(picture) {
        this.setState({ step: 2 }, () => {
            this.setState({ picture });
        });
    }

    zoomIn() {
        this.cropper.zoom(0.1);
    }

    zoomOut() {
        this.cropper.zoom(-0.1);
    }

    noErrors() {
        return !(this.form.getChildContext()._errors.length > 0);
    }

    handleInputChange(e) {
        const form = {};
        form[e.target.name] = e.target.value;
        this.setState({
            form: _.extend(this.state.form, form),
        });
    }

    handleDocTypeChange(e) {
        this.setState({
            form: _.extend(this.state.form, {
                tip: e.target.value,
                valabilitate: null,
            }),
        });
    }

    handleRadioDate(checked) {
        this.setState({ showDate: checked });

        if (!checked) {
            this.setState({
                form: _.extend(this.state.form, {
                    valabilitate: null,
                }),
            });
        }
    }

    handleRedo(e) {
        e.preventDefault();
        this.setState({ step: 0 });
    }

    handleAdd(e) {
        e.preventDefault();
        this.props.clearError();
        const image = this.cropper.getCroppedCanvas().toDataURL();
        const docs = _.extend({}, this.state.docs);
        const type = this.state.form.tip;

        // check size limit
        const alreadyUploadedImagesOfThisType =
            (this.state.docs[type] && this.state.docs[type].images) ||
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

        if (docs[type] && docs[type].asMutable) docs[type] = docs[type].asMutable();
        if (docs[type] && docs[type].images.asMutable) docs[type].images = docs[type].images.asMutable();

        if (!docs[type]) {
            docs[type] = {
                tip: this.state.form.tip,
                title: TYPES[this.state.form.tip],
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
            docs,
        });
    }

    async handleUpload(e) {
        const file = e.target.files[0];
        e.target.value = null;
        if (!file) {
            return;
        }
        this.props.clearError();
        this.props.showLoading();
        setTimeout(async () => {
            let image = null;
            if (FileService.isPDF(file)) {
                const images = await FileService.readImages(file);
                const docs = _.extend({}, this.state.docs);
                const type = this.state.form.tip;

                // check size limit
                const alreadyUploadedImagesOfThisType =
                    (this.state.docs[type] &&
                        this.state.docs[type].images) ||
                    [];

                const alreadyUploadedImagesOfThisTypeSize =
                    alreadyUploadedImagesOfThisType.reduce(
                        (acc, image) => acc + dataURLtoBlob(image).size,
                        0
                    );

                const newImagesSize = images.reduce(
                    (acc, image) => acc + dataURLtoBlob(image).size,
                    0
                );

                const total = bytesToMegaBytes(
                    alreadyUploadedImagesOfThisTypeSize + newImagesSize
                );

                if (total > IMAGES_TOTAL_SIZE_LIMIT_IN_MB) {
                    this.props.hideLoading();
                    const errMsg = 'Dimensiunea fisierului depaseste 10MB.';
                    this.props.setError(
                        errMsg
                    );

                    return;
                }
                // check size limit /

                _.each(images, (image) => {
                    if (docs[type] && docs[type].asMutable) docs[type] = docs[type].asMutable();
                    if (docs[type] && docs[type].images.asMutable) docs[type].images = docs[type].images.asMutable();

                    if (!docs[type]) {
                        docs[type] = {
                            tip: this.state.form.tip,
                            title: TYPES[this.state.form.tip],
                            valabilitate: this.state.form.valabilitate,
                            nr: null,
                            images: [], // thumbnails to be displayed
                            files: [], // actual file data to be uploaded
                        };
                    }

                    docs[type].images.push(image);
                });

                this.setState({
                    step: 0,
                    picture: null,
                    angle: 0,
                    docs,
                }, () => {
                    this.props.hideLoading();
                });
            } else {
                [image] = await FileService.readImages(file);
                this.setImage(image);
                this.props.hideLoading();
            }
        }, 250);
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.resetFormErrors();
        this.form.validateAll();
        this.props.clearError();
        if (this.noErrors()) {


            const {session} = this.props
            // TODO add fields
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event' : 'online_contract',
                'step': 11,
                // 'upload_type': $value,
                'document_type': TYPES[this.state.form.tip],
                // 'validity': $value,
                'client_type': session.contract_type === "b2c" ? "residential" : "business",
                'service_type': session.type === "EE" ? "ELECTRICA" : "GAZE_NATURALE",
            });


            if (_.size(this.state.docs) && this.state.docs.ACT_PROPRIETAR && this.state.docs.ACT_PROPRIETAR.images.length || this.state.form.declaratie_act_spatiu) {
                if (_.isEqual(this.props.docs, this.state.docs) && !this.state.form.declaratie_act_spatiu) {
                    this.props.markAction(pageService.actions.ADAUGARE_ACT_SPATIU.value);
                    pageService.scrollToTop();
                    browserHistory.push(pageService.links['contract-options']);
                } else {
                    try {
                        this.props.showLoading();
                        if (!this.state.form.declaratie_act_spatiu) {
                            await this.props.patchSession({
                                _loc_doc: _.pick(this.state.docs.ACT_PROPRIETAR, ['tip', 'nr', 'valabilitate']),
                                [`${this.props.flow}_loc`]: {
                                    declaratie_act_spatiu: false,
                                },
                            });
                        } else {
                            await this.props.patchSession({
                                [`${this.props.flow}_loc`]: _.pick(this.state.form, ['declaratie_act_spatiu', 'ownership_valabilitate', 'ownership_role', 'ownership_role_desc', 'ownership_role_start_date']),
                            });
                        }
                        await this.props.uploadOwnerDocs(this.state.docs);
                        this.props.markAction(pageService.actions.ADAUGARE_ACT_SPATIU.value);
                        pageService.scrollToTop();

                        browserHistory.push(pageService.links['contract-options']);
                    } catch (e) {
                        const errMsg = 'Documentele nu au putut fi incarcate.';
                        this.props.setError(errMsg);
                        this.props.hideLoading();
                    }
                }
            } else {
                const { formErrors } = this.state;

                formErrors.docs.push('Te rugăm să atașezi actul de proprietate.');
                this.setState({
                    formErrors,
                });
                pageService.scrollToError();
            }
        } else {
            pageService.scrollToError();
        }
    }

    showModalOverlay(e) {
        e.preventDefault();
        this.setState({
            showModalOverlay: true,
        });
    }

    handleOverlayConfirm(e) {
        e.preventDefault();
        this.setState({ showModalOverlay: false });
        this.handleSubmit(e);
    }

    handleNextClick(e) {
        if (_.isEmpty(this.state.docs)) {
            this.handleSubmit(e);
        } else {
            this.showModalOverlay(e);
        }
    }

    handleOverlayDismiss(e) {
        e.preventDefault();
        this.setState({ showModalOverlay: false });
    }

    resetFormErrors() {
        const formErrors = {};
        _.each(this.state.formErrors, (section, key) => {
            formErrors[key] = [];
        });
        this.setState({ formErrors: _.extend(this.state.formErrors, formErrors) });
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

    handleDeleteDocImage(docIndex, imageIndex) {
        const docs = _.extend({}, this.state.docs);

        if (docs[docIndex] && docs[docIndex].asMutable) docs[docIndex] = docs[docIndex].asMutable();
        if (docs[docIndex] && docs[docIndex].images.asMutable) docs[docIndex].images = docs[docIndex].images.asMutable();

        docs[docIndex].images.splice(imageIndex, 1);
        if (docs[docIndex].images.length == 0) {
            delete docs[docIndex];
        }

        this.setState({ docs });
    }

    onRoleChange(e) {
        const state = { ...this.state, form: { ...this.state.form, ownership_role: e.target.value } };
        if (e.target.value === 'alte cazuri') {
            this.setState({ ...state, showDataValabilitate: false, showCustomCustomerRoleInput: true });
        } else if (e.target.value === 'chirias/comodatar') {
            this.setState({ ...state, showDataValabilitate: true, showCustomCustomerRoleInput: false });
        } else {
            this.setState({ ...state, showDataValabilitate: false, showCustomCustomerRoleInput: false });
        }
    }

    renderDateInput() {
        if (this.state.showDate) {
            return (
                <div className="row validity-date">
                    <Input
                        name="valabilitate"
                        value={this.state.form.valabilitate}
                        onChange={this.handleInputChange}
                        className="form-control"
                        containerClass="mb-3 col-md-12"
                        type="date"
                        label="Valabil pana la"
                        dateFormat="DD.MM.YYYY"
                        validations={[required, value => laterThanDays(value, 30)]}
                    />
                </div>
            );
        }
    }

    renderInteraction() {
        switch (this.state.step) {
        default:
        case 0:
            return (
                <div className="container main-area doc-interaction">
                    <Form>
                        <div className="hide-tablet upload-doc" style={{ justifyContent: 'space-between' }}>
                            {/* <div className="order-md-1 col-md-5">
                                    <label
                                        className="btn btn-primary button--upload"
                                        href="#"
                                        onClick={this.enableCam}
                                    >
                                        <div className={'row'}>
                                            <div className={'col-5'}>
                                                <p>Fotografiază documentul folosind camera dispozitivului</p>
                                            </div>
                                            <div className={'col-5'}>
                                                <span className="button"><img
                                                    src="imgs/btn-med-photo@2x.png"
                                                    alt="photo"
                                                /></span>
                                            </div>

                                        </div>


                                    </label>
                                </div> */}
                            {/* <div className="order-md-1 col-md-2 ta-c">
                                    <div className="vertical-separator">
                                        <p>sau</p>
                                    </div>
                                </div> */}

                            <div>
                                <div className="btn btn-doc-upload button--upload" href="#" onClick={this.enableCam}>
                                    <div style={{
                                        padding: 16,
                                        borderRadius: 4,
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        display: 'inline-flex',
                                    }}>

                                        <div className="col-2" style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Ping LCG', fontWeight: '700' }}>
                                            Fotografiază documentul<br />folosind camera
                                            <br />dizpozitivului
                                        </div>
                                        <div className="Action" style={{ width: 48, height: 48, position: 'relative' }}>
                                            <span><img src="svg/arrow_right.svg" /></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{}}>
                                <label htmlFor="upload" style={{ width: '100%' }}>
                                    <div className="btn btn-doc-upload button--upload" href="#">
                                        <div style={{
                                            padding: 16,
                                            borderRadius: 4,
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            display: 'inline-flex',
                                        }}>
                                            <input
                                                id="upload"
                                                className="upload-file-btn"
                                                type="file"
                                                onChange={this.handleUpload}
                                            />
                                            {/* <label htmlFor={uploadId} className="button--upload"> */}
                                            {/*     <div className={'row'}> */}
                                            <div className="col-10" style={{ textAlign: 'left', color: '#FAFAFA', fontSize: 16, fontFamily: 'Ping LCG', fontWeight: '700' }}>
                                                <span>Încarcă o fotografie<br />existentă<br />*pdf, png, jpg, jpeg</span>
                                            </div>
                                            <div className="col-2" style={{ width: 48, height: 48, position: 'relative' }}>

                                                <span><img src="svg/arrow_right.svg" /></span>
                                                {/* </label> */}
                                            </div>
                                            {/* </div> */}

                                            {/* </label> */}
                                        </div>
                                    </div>
                                </label>

                            </div>
                            {/* <div className="order-md-1 col-md-5">
                                    <input
                                        type="file"
                                        id="upload"
                                        onChange={this.handleUpload}
                                    />
                                    <label htmlFor="upload" className="round-button-text button--upload">
                                        <span className="button"><img
                                            src="imgs/btn-med-upload@2x.png"
                                            alt="photo"
                                        /></span>
                                        <p>Încarcă o fotografie existentă<br />*pdf, png, jpg, jpeg</p>
                                    </label>
                                </div> */}
                        </div>
                        {/* <div className="row show-tablet">
                                <label htmlFor="upload" className="round-button-text button--upload">
                                    <span className="button"><img src="imgs/btn-med-photo@2x.png" alt="photo" /></span>
                                    <p>Fotografiază documentul folosind camera dispozitivului<br />sau<br />încarcă o
                                        fotografie existentă<br />*pdf, png, jpg, jpeg</p>
                                </label>
                            </div> */}
                        <DocList
                            title="Documente încărcate"
                            docs={this.state.docs}
                            onDelete={this.handleDeleteDocImage}
                        />
                        <div className="text-center offset-top spaced-bottom-lg" style={{ textTransform: 'uppercase' }}>
                            <Button type="submit" className="btn btn-primary col-12" onClick={this.handleNextClick}>
                                Continuă
                            </Button>
                        </div>
                    </Form>
                </div>
            );
        case 2:
            return (
                <div className="container main-area">
                    <div className="row" style={{ marginLeft: '0' }}>
                        <div id="pictureContainer">
                            <div className="zoom zoom-in icon-plus hide-mobile" onClick={this.zoomIn}>
                            </div>
                            <div className="zoom zoom-out icon-minus hide-mobile" onClick={this.zoomOut}>
                            </div>
                            <Cropper
                                ref={(c) => {
                                    this.cropper = c;
                                }}
                                src={this.state.picture}
                                style={{ height: pageService.isMobile() ? 250 : 400, width: '100%' }}
                                aspectRatio={210 / 297}
                                crop={this.cropPicture}
                                guides={false}
                                movable
                                scalable={false}
                                rotateTo={-this.state.angle}
                                zoomOnWheel={false}
                                zoomOnTouch
                                cropBoxMovable={false}
                                cropBoxResizable={false}
                                dragMode="move"
                                minCropBoxHeight={pageService.isMobile() ? 248 : 398}
                            />
                            <br />
                            <p>Roteşte</p>
                            <Slider
                                included={false}
                                min={-180}
                                max={180}
                                value={this.state.angle}
                                onChange={this.rotatePicture}
                                marks={{
                                    '-180': <span>-180&deg;</span>,
                                    '-90': <span>-90&deg;</span>,
                                    0: <span>0&deg;</span>,
                                    90: <span>90&deg;</span>,
                                    180: <span>180&deg;</span>,
                                }}
                            />
                        </div>
                    </div>

                    <div className="offset-top col-md-12" style={{ paddingLeft: '0' }}>
                        <button type="submit" className="btn btn-outline-secondary" onClick={this.handleRedo}>
                            Reincearcă
                        </button>
                        <button type="submit" className="btn btn-primary" onClick={this.handleAdd}>
                            Adaugă
                        </button>
                    </div>
                </div>
            );
        }
    }

    getDocTypes() {
        let types = {};

        if (this.props.flow == 'gaz') {
            types = _.pick(TYPES, [
                'ACT_PROPRIETAR',
                'DOC_ACORD_ACCES',
                'ALTELE',
            ]);
        } else {
            types = _.pick(TYPES, [
                'ACT_PROPRIETAR',
                'CER',
                'ATR',
                'ALTELE',
            ]);
        }

        return _.map(types, (label, value) => ({ value, label }));
    }

    renderValidity() {
        if (this.state.form.tip == 'ACT_PROPRIETAR') {
            return (
                <div className="mb-3 col-md-12">
                    <div className="row">
                        <div className="order-md-1 col-md-12 validity-checkbox-group">
                            <label className="control-label">Valabilitate</label>
                            <div className="row">
                                <div className="mb-3 col-md-8">
                                    <div className="custom-control custom-radio">
                                        <input
                                            type="radio"
                                            name="radio-group1"
                                            className="custom-control-input"
                                            id="formCustomRadio118"
                                            checked={!this.state.showDate}
                                            onChange={() => {
                                            }}
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="formCustomRadio118"
                                            onClick={() => this.handleRadioDate(false)}
                                        >Nedeterminată</label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="mb-3 col-md-8">
                                    <div className="custom-control custom-radio">
                                        <input
                                            type="radio"
                                            name="radio-group1"
                                            className="custom-control-input"
                                            id="formCustomRadio119"
                                            checked={this.state.showDate}
                                            onChange={() => {
                                            }}
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="formCustomRadio119"
                                            onClick={() => this.handleRadioDate(true)}
                                        >Determinată</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderDateInput()}
                </div>
            );
        }
    }

    render() {
        if (this.state.step === 1) {
            return (
                <Scanner
                    title="Fotografiază documentul"
                    format="a4"
                    onBack={() => this.changeStep(0)}
                    onPicture={image => this.setImage(image)}
                />
            );
        }

        return (
            <div className="ClientPlaceDocs">
                <ModalOverlay
                    show={this.state.showModalOverlay}
                    onClose={this.handleOverlayDismiss}
                >
                    <ConfirmOverlay
                        title={<span>Ai terminat de încărcat<br />toate documentele<br />locului de consum?</span>}
                        confirmLabel="DA"
                        dismissLabel="NU"
                        onConfirm={this.handleOverlayConfirm}
                        onDismiss={this.handleOverlayDismiss}
                        show={this.state.showModalOverlay}
                        noLogo
                        noFixed
                        big
                    />
                </ModalOverlay>
                <HeaderHero
                    title="Documentele locului de consum"
                    description="Completează în câmpurile de mai jos datele despre locul de consum."
                    backgroundColor="#55be5a"
                    showRegistrationInfo
                />
                <div className="page-description">
                    <div className="main-content">
                        Te rugăm să încarci documentele necesare pentru locul de consum. Poți alege una din opțiunile de
                        mai jos pentru a fotografia sau încărca o imagine.
                    </div>
                </div>
                <div className="main-content doc-options">
                    <div className="row">
                        <Form
                            className="single-column"
                            ref={(c) => {
                                this.form = c;
                            }}
                        >
                            {this.renderFormErrors('docs')}
                            <div className="order-md-1 col-md-12">
                                <div className="custom-control custom-checkbox proof-of-address-container">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="declaratie-act-spatiu"
                                        checked={this.state.form.declaratie_act_spatiu}
                                        onChange={() => {
                                            const form = {
                                                ...this.state.form,
                                                declaratie_act_spatiu: !this.state.form.declaratie_act_spatiu,
                                            };
                                            if (!this.state.form.declaratie_act_spatiu) {
                                                form.ownership_valabilitate = null;
                                            }

                                            this.setState({ form });
                                        }
                                        }
                                    />
                                    <label className="custom-control-label" htmlFor="declaratie-act-spatiu">Declaratie
                                        act spatiu</label>
                                </div>
                                {this.state.form.declaratie_act_spatiu &&
                                    <Fragment>
                                        <div className="row">
                                            <Select
                                                className="form-control"
                                                containerClass="mb-3 col-md-6"
                                                label="Rol client"
                                                name="ownership_role"
                                                items={this.state.customerRoles}
                                                onSelect={this.onRoleChange}
                                                value={this.state.form.ownership_role}
                                            />
                                        </div>
                                        <div className="row">
                                            {this.state.showDataValabilitate && (
                                                <Input
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    label="Data valabilitate act spatiu"
                                                    name="ownership_valabilitate"
                                                    validations={[required, laterThanToday]}
                                                    type="date"
                                                    dateFormat="DD.MM.YYYY"
                                                    onChange={this.handleInputChange}
                                                    value={this.state.form.ownership_valabilitate}
                                                />
                                            )}
                                            {this.state.showCustomCustomerRoleInput && (
                                                <Input
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    label="Alte cazuri"
                                                    name="ownership_role_desc"
                                                    validations={[value => maxLength(value, 128)]}
                                                    onChange={this.handleInputChange}
                                                    value={this.state.form.ownership_role_desc}
                                                />
                                            )}
                                            {this.state.supply && this.state.schimba_titular && !this.state.schimba_furnizor && (
                                                <Input
                                                    className="form-control"
                                                    containerClass="mb-3 col-md-4"
                                                    label="Data de la care se utilizeaza spatiu"
                                                    placeholder="mm/yyyy"
                                                    name="ownership_role_start_date"
                                                    validations={[required, month]}
                                                    onChange={this.handleInputChange}
                                                    value={this.state.form.ownership_role_start_date}
                                                />
                                            )}
                                        </div>
                                    </Fragment>
                                }
                                {!this.state.form.declaratie_act_spatiu &&
                                    <Fragment>
                                        <div className="row client-autocomplete">
                                            <Select
                                                name="tip"
                                                label="Tip document"
                                                placeholder="Alege"
                                                value={this.state.form.tip}
                                                errorLabel="Alege un furnizor."
                                                className="form-control"
                                                containerClass="mb-3 col-md-12"
                                                validations={[required]}
                                                onSelect={this.handleDocTypeChange}
                                                items={this.getDocTypes()}
                                            />
                                        </div>
                                        {this.renderValidity()}
                                    </Fragment>
                                }
                            </div>
                        </Form>
                    </div>
                </div>
                {this.state.form.declaratie_act_spatiu &&
                    <div className="main-content bottom-margin doc-interaction">
                        <Form>
                            <div className="text-center offset-top spaced-bottom-lg">
                                <Button type="submit" className="btn btn-primary col-12" style={{ textTransform: 'uppercase' }} onClick={this.handleNextClick}>
                                    Continuă
                                </Button>
                            </div>
                        </Form>
                    </div>
                }
                {!this.state.form.declaratie_act_spatiu &&
                    <div className="main-content bottom-margin" >
                        {this.renderInteraction()}
                    </div>
                }
            </div>
        );
    }
}

ClientPlaceDocs.propTypes = propTypes;
ClientPlaceDocs.defaultProps = defaultProps;

const mapStateToProps = state => ({
    flow: getFlow(state).toLowerCase(),
    clientOptions: getClientOptions(state),
    nlc: getNLC(state),
    docs: getOwnerDocs(state),
    session: getSession(state),
    counties: getItems(state),
});

const mapDispatchToProps = {
    patchSession,
    uploadOwnerDocs,
    setError,
    clearError,
    showLoading,
    hideLoading,
    markAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClientPlaceDocs);
