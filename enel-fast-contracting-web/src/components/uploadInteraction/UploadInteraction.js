import React, { useState, Fragment } from 'react';
import Form from 'components/validation/form';
import Button from 'components/validation/button';
import pageService from 'services/page';
import PropTypes from 'prop-types';
import ModalOverlay from 'components/overlays/ModalOverlay';
import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import _ from 'lodash';
import UploadInteractionStep0 from './UploadInteractionStep0';
import UploadInteractionStep2 from './UploadInteractionStep2';
import { required } from "components/validation/rules";
import Select from "components/validation/select";


const propTypes = {
    step: PropTypes.number.isRequired,
    docs: PropTypes.object.isRequired,
    handleDelete: PropTypes.func.isRequired,
    cropper: PropTypes.object,
    picture: PropTypes.string,
    angle: PropTypes.number.isRequired,
    handleAdd: PropTypes.func.isRequired,
    setCropper: PropTypes.func.isRequired,
    setVariables: PropTypes.func.isRequired,
    setMobileInput: PropTypes.func,
    mobileInput: PropTypes.object,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    docType: PropTypes.string,
    setError: PropTypes.func,
    shouldReadPdf: PropTypes.bool,
    valabilitate: PropTypes.string,
    pdf: PropTypes.object,
    docTypes: PropTypes.array,
};

const defaultProps = {
    picture: null,
    cropper: null,
    setMobileInput: () => {
    },
    mobileInput: {},
    handleSubmit: () => {
    },
    showLoading: () => {
    },
    hideLoading: () => {
    },
    docType: '',
    setError: () => {
    },
    shouldReadPdf: false,
    valabilitate: '',
    pdf: null,
    docTypes: [],
};

const BUSINESS_DOC_TYPES = [
    { label: 'Certificat de inregistrare societate', value: 'REGISTRATION_FISC_CERT' },
    { label: 'Imputernicire/Certificat constator de la registrul comertului', value: 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE' }
];

const UploadInteraction = ({
    step,
    docs,
    handleDelete,
    picture,
    angle,
    handleAdd,
    setCropper,
    setVariables,
    setMobileInput,
    mobileInput,
    handleSubmit,
    showLoading,
    hideLoading,
    docType,
    setError,
    shouldReadPdf,
    valabilitate,
    pdf,
    overlayText,
    docTypes,
    setDocs,
    currentType,
}) => {
    const [showModalOverlay, setShowModalOverlay] = useState(false);
    const [docTypeLocal, setType] = useState("REGISTRATION_FISC_CERT");
    const handleOverlayDismiss = (e) => {
        e.preventDefault();
        setShowModalOverlay(false);
        if (pageService.isMobile()) {
            mobileInput.click();
        }
    };

    const handleOverlayConfirm = (e) => {
        e.preventDefault();
        setShowModalOverlay(false);
        handleSubmit(e);
    };

    const handleNextClick = (e) => {
        e.preventDefault();
        if (_.isEmpty(docs) || docs.id) {
            handleSubmit(e);
        } else {
            setShowModalOverlay(true);
        }
    };

    return (
        <Fragment>
            <ModalOverlay
                show={showModalOverlay}
                onClose={handleOverlayDismiss}
            >
                <ConfirmOverlay
                    title={overlayText}
                    confirmLabel="DA"
                    dismissLabel="NU"
                    onConfirm={handleOverlayConfirm}
                    onDismiss={handleOverlayDismiss}
                    show={showModalOverlay}
                    noLogo
                    noFixed
                    big
                />
            </ModalOverlay>
            {docTypes.length ? (
                <div className="main-content" >
                    <div className="container doc-interaction">
                        <Form>
                            <Select
                                name="tip"
                                label="Tip document"
                                placeholder="Alege"
                                value={docTypeLocal}
                                errorLabel="Alege un furnizor."
                                className="form-control"
                                containerClass="mb-3 col-md-12"
                                validations={[required]}
                                onSelect={(e) => setType(e.target.value)}
                                items={BUSINESS_DOC_TYPES}
                            />
                            {docTypes.filter(item => item === docTypeLocal).map(type => {
                                return <div className="container list-area">
                                    {(step === 0 || (currentType && currentType !== type)) && (
                                        <UploadInteractionStep0
                                            docs={docs}
                                            handleDelete={handleDelete}
                                            setVariables={setVariables}
                                            setMobileInput={setMobileInput}
                                            showLoading={showLoading}
                                            hideLoading={hideLoading}
                                            docType={type}
                                            setError={setError}
                                            shouldReadPdf={shouldReadPdf}
                                            valabilitate={valabilitate}
                                            pdf={pdf}
                                            uploadId={`upload-${type}`}
                                            setDocs={setDocs}
                                            type={type}
                                        />
                                    )}
                                    {(step === 2 && (currentType && currentType === type)) && (
                                        <UploadInteractionStep2
                                            picture={picture}
                                            angle={angle}
                                            handleAdd={handleAdd}
                                            setCropper={setCropper}
                                            setVariables={setVariables}
                                            type={type}
                                            title={BUSINESS_DOC_TYPES.find(({ value }) => value === type).label}
                                        />
                                    )}
                                </div>
                            }
                            )}
                            <div className="text-center offset-top spaced-bottom-lg" style={{paddingBottom: '10rem', paddingTop: '5rem'}}>
                                <Button className="btn btn-primary col-12" onClick={handleNextClick}>
                                    Continuă
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            ) : (
                <div className="main-content" >
                    {step === 0 && (
                        <div className="doc-interaction">
                            <Form>
                                <UploadInteractionStep0
                                    docs={docs}
                                    handleDelete={handleDelete}
                                    setVariables={setVariables}
                                    setMobileInput={setMobileInput}
                                    showLoading={showLoading}
                                    hideLoading={hideLoading}
                                    docType={docType}
                                    setError={setError}
                                    shouldReadPdf={shouldReadPdf}
                                    valabilitate={valabilitate}
                                    pdf={pdf}
                                    uploadId="upload"
                                />
                                <div className="text-center offset-top spaced-bottom-lg" style={{paddingBottom: '10rem'}}>
                                    <Button className="btn btn-primary col-12" onClick={handleNextClick}>
                                        Continuă
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}
                    {step === 2 && (
                        <UploadInteractionStep2
                            picture={picture}
                            angle={angle}
                            handleAdd={handleAdd}
                            setCropper={setCropper}
                            setVariables={setVariables}
                        />
                    )}
                </div>
            )}
        </Fragment>
    );
};

UploadInteraction.propTypes = propTypes;
UploadInteraction.defaultProps = defaultProps;

export default UploadInteraction;
