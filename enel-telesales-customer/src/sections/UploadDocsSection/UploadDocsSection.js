import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
    uploadID,
    uploadRegistrationFisc,
    uploadPowerOfAttorneyOrReg,
    unsetID as unsetDocID,
    uploadInvoice,
    uploadOwnerDocs,
    deleteDoc,
    setDoc,
} from 'store/documents/actions';
import * as docsSelectors from 'store/documents/selectors';
import { getSession } from 'store/session/selectors';

import { showLoading, hideLoading, setDocLoading, unsetDocLoading } from 'store/ui/actions';
import { isDocLoading } from 'store/ui/selectors';
import FileService from 'services/file';

import Select from 'components/Select';
import Section from 'components/Section';
import DocList from 'components/docs/DocList';
import Cropper from 'components/Cropper';
import CardSelection from './components/CardSelection';
import CardPreview from './components/CardPreview';

import { dataURLtoBlob, bytesToMegaBytes } from '../../utils';

import './UploadDocsSection.scss';

const CAMERA_IMAGES_TOTAL_SIZE_LIMIT_IN_MB = 9;

const propTypes = {
    uploadID: PropTypes.func.isRequired,
    uploadRegistrationFisc: PropTypes.func.isRequired,
    uploadPowerOfAttorneyOrReg: PropTypes.func.isRequired,
    uploadInvoice: PropTypes.func.isRequired,
    uploadOwnerDocs: PropTypes.func.isRequired,
    deleteDoc: PropTypes.func.isRequired,
};

const defaultProps = {};

const TYPES = {
    ACT_PROPRIETAR: 'Act spaţiu',
    CER: 'Certificat Racordare',
    ATR: 'Aviz Tehnic de Racordare',
    DOC_ACORD_ACCES: 'Acord Acces',
    ALTELE: 'Alte Documente',
    FACT_CLIENT: 'Factura',
    REGISTRATION_FISC_CERT: 'Certificat de inregistrare societate',
    IMPUTERNICIRE_OR_DOC_CONSTITUIVE:
        'Imputernicire/Certificat constator de la registrul comertului',
    // POWER_ATTORNEY: 'Imputernicire',
    // DOC_CONSTITUIVE:
    //     'Actul constitutiv sau statutul/certificatul constatator de la registrulcomerțului',
};

class UploadDocsSection extends Component {
    state = {
        cropImage: null,
        cropIndex: null,
        docType: '',
        docs: {
            ee: {
                ACT_PROPRIETAR: {
                    title: TYPES.ACT_PROPRIETAR,
                    images: [],
                },
                FACT_CLIENT: {
                    title: TYPES.FACT_CLIENT,
                    images: [],
                },
                REGISTRATION_FISC_CERT: {
                    title: TYPES.REGISTRATION_FISC_CERT,
                    images: [],
                },
                IMPUTERNICIRE_OR_DOC_CONSTITUIVE: {
                    title: TYPES.IMPUTERNICIRE_OR_DOC_CONSTITUIVE,
                    images: [],
                },
            },
            gaz: {
                ACT_PROPRIETAR: {
                    title: TYPES.ACT_PROPRIETAR,
                    images: [],
                },
                FACT_CLIENT: {
                    title: TYPES.FACT_CLIENT,
                    images: [],
                },
                REGISTRATION_FISC_CERT: {
                    title: TYPES.REGISTRATION_FISC_CERT,
                    images: [],
                },
                IMPUTERNICIRE_OR_DOC_CONSTITUIVE: {
                    title: TYPES.IMPUTERNICIRE_OR_DOC_CONSTITUIVE,
                    images: [],
                },
            },
        },
        imagesSizeLimitErrors: {},
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        const { session } = this.props;
        if (session.type == 'COMBO') {
            _.map(TYPES, (value, key) => {
                if (
                    prevProps.docs.ee &&
                    !prevProps.docs.ee[key] &&
                    this.props.docs.ee[key] &&
                    this.props.docs.ee[key].length > 0
                ) {
                    this.setImages(this.props.docs.ee[key], key, 0);
                }
                if (
                    prevProps.docs.gaz &&
                    !prevProps.docs.gaz[key] &&
                    this.props.docs.gaz[key] &&
                    this.props.docs.gaz[key].length > 0
                ) {
                    this.setImages(this.props.docs.gaz[key], key, 1);
                }
            });
        } else {
            _.map(TYPES, (value, key) => {
                if (
                    prevProps.docs[session.type.toLowerCase()] &&
                    !prevProps.docs[session.type.toLowerCase()][key] &&
                    this.props.docs[session.type.toLowerCase()][key] &&
                    this.props.docs[session.type.toLowerCase()][key].length > 0
                ) {
                    this.setImages(this.props.docs[session.type.toLowerCase()][key], key, 0);
                }
            });
        }
    }

    getFlow(index) {
        const { session } = this.props;
        return session.type == 'COMBO' ? (index === 1 ? 'gaz' : 'ee') : session.type.toLowerCase();
    }

    getDocOptions(index) {
        return [
            { value: 'CER', label: TYPES.CER },
            { value: 'ATR', label: TYPES.ATR },
            { value: 'DOC_ACORD_ACCES', label: TYPES.DOC_ACORD_ACCES },
        ];
    }

    shouldRenderPlaceDocs(index) {
        const { session } = this.props;
        const flow = this.getFlow(index);
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

            return !(
                isEnelCounty &&
                nlcInfo.piata == 'PR' &&
                !changeOwner &&
                nlcInfo.cnp &&
                nlcInfo.status !== 'INACTIV'
            );
        }

        return true;
    }

    setImages(images, docType, podIndex) {
        return new Promise((resolve) => {
            const flow = this.getFlow(podIndex);
            const type = docType || this.state.docType;
            let docs = { ...this.state.docs };
            if (!docs[flow][type]) {
                this.initDoc(docs, type, images, podIndex);
            } else {
                docs[flow][type].images = docs[flow][type].images.concat(images);
            }
            this.setState({ docs }, () => {
                this.props.setDoc([...this.state.docs[flow][type].images], type, flow);
                resolve();
            });
        });
    }

    cleanDocs(docs, docType, podIndex) {
        if (docType) {
            const flow = this.getFlow(podIndex);
            const docsKey = Object.keys(docs[flow]);
            for (let i = 0; i < docsKey.length; i++) {
                const docKey = docsKey[i];
                if (
                    docKey !== 'FACT_CLIENT' &&
                    docKey !== 'ACT_PROPRIETAR' &&
                    docKey !== 'REGISTRATION_FISC_CERT' &&
                    docKey !== 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE' &&
                    docKey !== docType &&
                    docs[flow][docKey].images.length === 0
                ) {
                    delete docs[flow][docKey];
                    this.setState({
                        docs,
                    });
                }
            }
        }
    }

    initDoc(docs, newDocType, images = [], podIndex) {
        const flow = this.getFlow(podIndex);
        if (!docs[flow][newDocType]) {
            docs[flow][newDocType] = {
                title: TYPES[newDocType],
                images,
            };
            this.setState({ docs });
        }
    }

    async uploadDocs(images, podIndex, docT) {
        const { setDocLoading, unsetDocLoading } = this.props;
        const flow = this.getFlow(podIndex);
        let { docType } = this.state;

        if (docType === '' || !docType || (docType !== docT && docT)) {
            docType = docT;
        }
        // eslint-disable-next-line no-debugger
        // debugger;
        setDocLoading(flow, docType);
        if (docType === 'id') {
            await this.props.uploadID(images[0]);
        } else if (docType === 'REGISTRATION_FISC_CERT') {
            await this.props.uploadRegistrationFisc(
                this.state.docs[flow][docType].images,
                flow.toUpperCase()
            );
        } else if (docType === 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE') {
            await this.props.uploadPowerOfAttorneyOrReg(
                this.state.docs[flow][docType].images,
                flow.toUpperCase()
            );
        } else if (docType === 'FACT_CLIENT') {
            await this.props.uploadInvoice(
                this.state.docs[flow][docType].images,
                flow.toUpperCase()
            );
        } else {
            await this.props.uploadOwnerDocs(
                this.state.docs[flow][this.state.docType].images,
                this.state.docType,
                flow.toUpperCase()
            );
        }
        unsetDocLoading(flow, docType);
    }

    async handleDocSelect(e, docType, podIndex) {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        // this.props.showLoading();
        setTimeout(async () => {
            const images = await FileService.readImages(file);
            this.setState({ docType: docType });

            if (bytesToMegaBytes(file.size) > CAMERA_IMAGES_TOTAL_SIZE_LIMIT_IN_MB) {
                this.setState(state => ({
                    ...state,
                    imagesSizeLimitErrors: {
                        ...state.imagesSizeLimitErrors,
                        [docType]: true,
                    },
                }));
                return;
            }

            if (FileService.isPDF(file) && images.length > 1) {
                if (docType !== 'id') {
                    // check size limit
                    const alreadyUploadedImagesOfThisType =
                        (this.state.docs.ee[docType] && this.state.docs.ee[docType].images) || [];

                    const alreadyUploadedImagesOfThisTypeSize = alreadyUploadedImagesOfThisType.reduce(
                        (acc, image) => {
                            return acc + dataURLtoBlob(image).size;
                        },
                        0
                    );

                    const newImagesSize = images.reduce((acc, image) => {
                        return acc + dataURLtoBlob(image).size;
                    }, 0);

                    const total = bytesToMegaBytes(
                        alreadyUploadedImagesOfThisTypeSize + newImagesSize
                    );

                    if (total > CAMERA_IMAGES_TOTAL_SIZE_LIMIT_IN_MB) {
                        this.setState(state => ({
                            ...state,
                            imagesSizeLimitErrors: {
                                ...state.imagesSizeLimitErrors,
                                [docType]: true,
                            },
                        }));
                        return;
                    }
                    // check size limit /

                    await this.setImages(images, docType, podIndex);
                }
                // eslint-disable-next-line no-debugger
                // debugger;
                await this.uploadDocs(images, podIndex, docType);
            } else {
                const alreadyUploadedImagesOfThisType =
                    (this.state.docs.ee[docType] && this.state.docs.ee[docType].images) || [];
                const alreadyUploadedImagesOfThisTypeSize = alreadyUploadedImagesOfThisType.reduce(
                    (acc, image) => {
                        return acc + dataURLtoBlob(image).size;
                    },
                    0
                );

                const newImageSize = dataURLtoBlob(images[0]).size;
                const total = bytesToMegaBytes(alreadyUploadedImagesOfThisTypeSize + newImageSize);

                if (total > CAMERA_IMAGES_TOTAL_SIZE_LIMIT_IN_MB) {
                    this.setState(state => ({
                        ...state,
                        imagesSizeLimitErrors: { ...state.imagesSizeLimitErrors, [docType]: true },
                    }));
                    return;
                }

                if (docType !== 'id') {
                    await this.setImages(images[0], docType, podIndex);
                }
                // eslint-disable-next-line no-debugger
                // debugger;
                this.uploadDocs([images[0]], podIndex, docType);
                // this.setState({ cropImage: images[0], cropIndex: podIndex }, () => {
                // this.props.hideLoading();
                // });
            }
        }, 250);
    }

    handlePhotoTake(image, docType, podIndex) {
        this.setState({ docType: docType });
        this.setState({ cropImage: image, cropIndex: podIndex });
    }

    async handleCropSave() {
        // this.props.showLoading();
        setTimeout(async () => {
            const cropped = this.cropper.picture.getCroppedCanvas().toDataURL();

            const { docType } = this.state;

            // ----------------------------
            const alreadyUploadedImagesOfThisType =
                (this.state.docs.ee[docType] && this.state.docs.ee[docType].images) || [];
            const alreadyUploadedImagesOfThisTypeSize = alreadyUploadedImagesOfThisType.reduce(
                (acc, image) => {
                    return acc + dataURLtoBlob(image).size;
                },
                0
            );

            const newImageSize = dataURLtoBlob(cropped).size;
            const total = bytesToMegaBytes(alreadyUploadedImagesOfThisTypeSize + newImageSize);

            if (total > CAMERA_IMAGES_TOTAL_SIZE_LIMIT_IN_MB) {
                this.handleCropCancel();
                this.setState(state => ({
                    ...state,
                    imagesSizeLimitErrors: { ...state.imagesSizeLimitErrors, [docType]: true },
                }));
                return;
            }
            // ----------------------

            if (docType !== 'id') {
                await this.setImages(cropped, docType, this.state.cropIndex);
            }
            this.uploadDocs([cropped], this.state.cropIndex);
            // this.props.hideLoading();
            this.handleCropCancel();
        }, 250);
    }

    handleCropCancel() {
        this.setState({ cropImage: null });
    }

    async handleCardDelete() {
        await this.props.deleteDoc('CI', 'GAZ');
        await this.props.deleteDoc('CI', 'EE');
        this.props.unsetDocID();
        // this.handleCropCancel();
    }

    async handleImageDelete(docIndex, imageIndex, podIndex) {
        const { setDocLoading, unsetDocLoading } = this.props;
        const flow = this.getFlow(podIndex);
        let docs = { ...this.state.docs };
        docs[flow][docIndex].images.splice(imageIndex, 1);
        this.cleanDocs(docs, docIndex, podIndex);

        if (docs[flow][docIndex].images.length > 0) {
            this.setState({ docType: docIndex }, () => {
                this.uploadDocs(docs[flow][docIndex].images, podIndex);
            });
        } else {
            setDocLoading(flow, docIndex);
            await this.props.deleteDoc(docIndex, flow.toUpperCase());
            unsetDocLoading(flow, docIndex);
        }
        this.setState({ docs }, () => {
            this.props.setDoc([...this.state.docs[flow][docIndex].images], docIndex, flow);
        });
    }

    handleDocTypeSelect(e, podIndex) {
        const newDocType = e.target.value;
        if (newDocType) {
            let { docs } = this.state;
            this.setState({
                docType: newDocType,
            });
            this.initDoc(docs, newDocType, [], podIndex);
            this.cleanDocs(docs, newDocType, podIndex);
        }
    }

    renderCropper() {
        if (this.state.cropImage) {
            return (
                <Cropper
                    ref={(c) => {
                        this.cropper = c;
                    }}
                    image={this.state.cropImage}
                    onSave={this.handleCropSave}
                    onCancel={this.handleCropCancel}
                    aspect={this.state.docType === 'id' ? 'idCard' : 'page'}
                />
            );
        }
    }

    renderCard() {
        if (!this.state.cropImage) {
            const { isDocLoading } = this.props;
            const flow = this.getFlow(0);
            let { REGISTRATION_FISC_CERT, IMPUTERNICIRE_OR_DOC_CONSTITUIVE } = this.state.docs[
                flow
            ];
            return (
                <Fragment>
                    <div className="section-title">Incarca documentul de identitate</div>
                    {this.props.session.contract_type === 'b2b' && (
                        <Fragment>
                            <DocList
                                docs={{ REGISTRATION_FISC_CERT }}
                                onDelete={(docIndex, imageIndex) =>
                                    this.handleImageDelete(docIndex, imageIndex, 0)
                                }
                                enableAdd
                                onAdd={(e, docType) => this.handleDocSelect(e, docType, 0)}
                                onPhoto={image =>
                                    this.handlePhotoTake(image, 'REGISTRATION_FISC_CERT', 0)
                                }
                                loading={isDocLoading(flow, 'REGISTRATION_FISC_CERT')}
                                errors={this.state.imagesSizeLimitErrors}
                            />
                            <DocList
                                docs={{ IMPUTERNICIRE_OR_DOC_CONSTITUIVE }}
                                onDelete={(docIndex, imageIndex) =>
                                    this.handleImageDelete(docIndex, imageIndex, 0)
                                }
                                enableAdd
                                onAdd={(e, docType) => this.handleDocSelect(e, docType, 0)}
                                onPhoto={image =>
                                    this.handlePhotoTake(
                                        image,
                                        'IMPUTERNICIRE_OR_DOC_CONSTITUIVE',
                                        0
                                    )
                                }
                                loading={isDocLoading(flow, 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE')}
                                errors={this.state.imagesSizeLimitErrors}
                            />
                        </Fragment>
                    )}
                    <h4 className="file-title">
                        Carte identitate
                        {this.props.session.contract_type === 'b2b' ? ' reprezentant legal' : ''}
                    </h4>
                    {this.props.idImg ? (
                        <CardPreview image={this.props.idImg} onDelete={this.handleCardDelete} />
                    ) : (
                        <CardSelection
                            onSelect={(e) => this.handleDocSelect(e, 'id')}
                            onPhoto={(image) => this.handlePhotoTake(image, 'id')}
                        />
                    )}
                </Fragment>
            );
        }
    }

    renderAddress(address) {
        let value = address.county.denumire;

        if (address.city) value += `, ${address.city}`;
        if (address.streetType && address.street)
            value += `, ${_.capitalize(address.streetType)} ${address.street}`;
        if (address.streetNo) value += `, Nr. ${address.streetNo}`;
        if (address.building) value += `, Bl. ${address.building}`;
        if (address.entrance) value += `, Sc. ${address.entrance}`;
        if (address.floor) value += `, Etaj ${address.floor}`;
        if (address.apartment) value += `, Ap ${address.apartment}`;

        return value;
    }

    renderPOD(index) {
        const { session, isDocLoading } = this.props;
        if (_.isEmpty(session)) {
            return;
        }

        const flow = this.getFlow(index);
        const place = session[`${flow}_loc`];

        let {
            FACT_CLIENT,
            ACT_PROPRIETAR,
            REGISTRATION_FISC_CERT,
            IMPUTERNICIRE_OR_DOC_CONSTITUIVE,
            ...docs
        } = this.state.docs[flow];
        const { docType } = this.state;

        return (
            <Fragment>
                <div className="pod-wrapper">
                    <div className="pod-value">
                        {flow == 'ee' ? 'POD' : 'CLC'}: {place.cod_pod || ''}
                        {place.address && (
                            <div className="pod-address">{this.renderAddress(place.address)}</div>
                        )}
                    </div>

                    {index === 0 && (
                        <DocList
                            docs={{ ACT_PROPRIETAR }}
                            onDelete={(docIndex, imageIndex) =>
                                this.handleImageDelete(docIndex, imageIndex, index)
                            }
                            enableAdd
                            onAdd={(e, docType) => this.handleDocSelect(e, docType, index)}
                            onPhoto={(image) =>
                                this.handlePhotoTake(image, 'ACT_PROPRIETAR', index)
                            }
                            loading={isDocLoading(flow, 'ACT_PROPRIETAR')}
                            errors={this.state.imagesSizeLimitErrors}
                        />
                    )}

                    <DocList
                        docs={{ FACT_CLIENT }}
                        onDelete={(docIndex, imageIndex) =>
                            this.handleImageDelete(docIndex, imageIndex, index)
                        }
                        enableAdd
                        onAdd={(e, docType) => this.handleDocSelect(e, docType, index)}
                        onPhoto={(image) => this.handlePhotoTake(image, 'FACT_CLIENT', index)}
                        loading={isDocLoading(flow, 'FACT_CLIENT')}
                        errors={this.state.imagesSizeLimitErrors}
                    />

                    <DocList
                        docs={docs}
                        onDelete={(docIndex, imageIndex) =>
                            this.handleImageDelete(docIndex, imageIndex, index)
                        }
                        enableAdd
                        onAdd={(e, docType) => this.handleDocSelect(e, docType, index)}
                        onPhoto={(image) => this.handlePhotoTake(image, this.state.docType, index)}
                        loading={
                            ![
                                'FACT_CLIENT',
                                'ACT_PROPRIETAR',
                                'REGISTRATION_FISC_CERT',
                                'IMPUTERNICIRE_OR_DOC_CONSTITUIVE',
                                'id',
                            ].includes(this.state.docType) && isDocLoading(flow, this.state.docType)
                        }
                        errors={this.state.imagesSizeLimitErrors}
                    />

                    {this.shouldRenderPlaceDocs(index) && (
                        <Select
                            name="choice"
                            label="Documentele locului de consum"
                            placeholder="Alege"
                            value={
                                docType == 'ACT_PROPRIETAR' ||
                                    docType == 'FACT_CLIENT' ||
                                    docType == 'REGISTRATION_FISC_CERT' ||
                                    docType == 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE' ||
                                    docType == 'id'
                                    ? ''
                                    : docType
                            }
                            className="form-control place-docs"
                            containerClass="mb-3 col-md-6"
                            validations={[]}
                            onSelect={(e) => this.handleDocTypeSelect(e, index)}
                            items={this.getDocOptions(index)}
                            upperCase
                        />
                    )}
                </div>
            </Fragment>
        );
    }

    renderPlaceDocs() {
        const { session } = this.props;
        if (!this.state.cropImage) {
            return (
                <Fragment>
                    <div className="section-title">Incarca documentele locului de consum</div>
                    {this.renderPOD(0)}
                    {!_.isEmpty(session) && session.type == 'COMBO' && this.renderPOD(1)}
                </Fragment>
            );
        }
    }

    render() {
        return (
            <Section className="UploadDocsSection">
                {this.renderCropper()}
                {this.renderCard()}
                {this.renderPlaceDocs()}
            </Section>
        );
    }
}

UploadDocsSection.propTypes = propTypes;
UploadDocsSection.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
    idImg: docsSelectors.getID(state),
    docs: docsSelectors.getDocs(state),
    session: getSession(state),
    isDocLoading: isDocLoading(state),
});

const mapDispatchToProps = {
    uploadID,
    uploadRegistrationFisc,
    uploadPowerOfAttorneyOrReg,
    showLoading,
    hideLoading,
    setDocLoading,
    unsetDocLoading,
    unsetDocID,
    uploadInvoice,
    uploadOwnerDocs,
    deleteDoc,
    setDoc,
};

export default connect(mapStateToProps, mapDispatchToProps)(UploadDocsSection);
