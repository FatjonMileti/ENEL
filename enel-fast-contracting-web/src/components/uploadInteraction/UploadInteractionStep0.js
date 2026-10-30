import React, { Fragment } from 'react';
import Form from 'components/validation/form';
import DocList from 'components/DocList';
import Button from 'components/validation/button';
import PropTypes from 'prop-types';
import FileService from 'services/file';
import _ from 'lodash';
import { dataURLtoBlob, bytesToMegaBytes } from 'utils';
import { IMAGES_TOTAL_SIZE_LIMIT_IN_MB, PLACE_DOC_TYPES } from 'utils/constants/file';


const propTypes = {
    docs: PropTypes.object.isRequired,
    handleDelete: PropTypes.func.isRequired,
    setVariables: PropTypes.func.isRequired,
    setMobileInput: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    docType: PropTypes.string,
    setError: PropTypes.func,
    shouldReadPdf: PropTypes.bool,
    valabilitate: PropTypes.string,
    pdf: PropTypes.object,
};

const defaultProps = {
    setMobileInput: () => {
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
};

const UploadInteractionStep0 = ({
    docs,
    handleDelete,
    setVariables,
    setMobileInput,
    showLoading,
    hideLoading,
    docType,
    setError,
    shouldReadPdf,
    valabilitate,
    pdf,
    uploadId,
    setDocs,
    type,
}) => {
    const enableCam = (e) => {
        e.preventDefault();
        setVariables({ step: 1 });
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        e.target.value = null;
        if (!file) {
            return;
        }

        showLoading();
        setTimeout(async () => {
            let image = null;
            if (docType !== 'CI' && FileService.isPDF(file)) {
                const images = await FileService.readImages(file);

                const newDocs = _.extend({}, docs);

                // check size limit
                const alreadyUploadedImagesOfThisType =
                    (newDocs[docType] &&
                        newDocs[docType].images) ||
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
                    hideLoading();

                    setError(
                        'Dimensiunea fisierului depaseste 10MB.'
                    );

                    return;
                }
                // check size limit /

                if (newDocs[docType] && newDocs[docType].asMutable) newDocs[docType] = newDocs[docType].asMutable();
                if (newDocs[docType] && newDocs[docType].images.asMutable) newDocs[docType].images = newDocs[docType].images.asMutable();
                _.each(images, (image) => {
                    if (!newDocs[docType]) {
                        newDocs[docType] = {
                            tip: docType,
                            title: shouldReadPdf ? docType : PLACE_DOC_TYPES[docType],
                            valabilitate,
                            nr: null,
                            images: [], // thumbnails to be displayed
                            files: [], // actual file data to be uploaded
                        };
                    }

                    newDocs[docType].images.push(image);
                });

                if (setDocs) {
                    setDocs(newDocs);
                } else {
                    setVariables({ docs: newDocs });
                }

                setVariables({
                    step: 0,
                    picture: null,
                    angle: 0,
                });

                if (shouldReadPdf) {
                    const newPdf = await FileService.readFile(file);
                    setVariables({ pdf: pdf ? null : newPdf });
                }
                hideLoading();
            } else {
                [image] = await FileService.readImages(file);
                setVariables({ step: 2, picture: image, currentType: type });
                hideLoading();
            }
        }, 250);
    };

    const handleDeleteDocImage = (docIndex, imageIndex) => {
        const newDocs = { ...docs };

        if (newDocs[docIndex] && newDocs[docIndex].asMutable) newDocs[docIndex] = newDocs[docIndex].asMutable();
        if (newDocs[docIndex] && newDocs[docIndex].images.asMutable) newDocs[docIndex].images = newDocs[docIndex].images.asMutable();

        newDocs[docIndex].images.splice(imageIndex, 1);
        if (newDocs[docIndex].images.length == 0) {
            setVariables({ pdf: null });
            delete newDocs[docIndex];
        }

        setVariables({ docs: newDocs });
    };

    return (
        <Fragment>
            <div className="hide-tablet upload-doc" style={{ justifyContent: 'space-between' }}>
                {/* <div className="col-12"> */}
                {/*     <div className={'row'}> */}
                <div style={{ width: '100%', marginRight: '50px' }}>
                    <div className="btn btn-doc-upload button--upload" style={{ width: '100%' }} href="#" onClick={enableCam}>
                        <div style={{
                            // padding: 16,
                            borderRadius: 4,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            display: 'flex',
                            gap: '20px'
                        }}>

                            <div style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Ping LCG', fontWeight: '700', textTransform: 'none', textAlign: 'start' }}>
                                Fotografiază documentul<br />folosind camera
                                <br />dizpozitivului
                            </div>
                            <div className="Action" style={{ width: 48, height: 48, position: 'relative' }}>
                                <span><img src={'svg/arrow_right.svg'} /></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%' }}>
                    <label htmlFor={uploadId} style={{ width: '100%' }}>
                        <div className="btn btn-doc-upload button--upload" style={{ width: '100%' }} href="#">
                            <div style={{
                                // padding: 16,
                                borderRadius: 4,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                display: 'flex',
                                gap: '50px'
                            }}>
                                <input
                                    id={uploadId}
                                    className="upload-file-btn"
                                    type="file"
                                    onChange={handleUpload}
                                    ref={(c) => {
                                        setMobileInput(c);
                                    }}
                                />
                                {/* <label htmlFor={uploadId} className="button--upload"> */}
                                {/*     <div className={'row'}> */}
                                <div style={{ textAlign: 'left', color: '#FAFAFA', fontSize: 16, fontFamily: 'Ping LCG', fontWeight: '700', textTransform: 'none' }}>
                                    <span>Încarcă o fotografie<br />existentă<br />*pdf, png, jpg, jpeg</span>
                                </div>
                                <div style={{ width: 48, height: 48, position: 'relative' }}>

                                    <span><img src={'svg/arrow_right.svg'} /></span>
                                    {/* </label> */}
                                </div>
                                {/* </div> */}

                                {/* </label> */}
                            </div>
                        </div>
                    </label>

                </div>
                {/*     </div> */}
                {/* </div> */}
                {/* <div className="order-md-1 col-md-5"> */}

                {/*     <label htmlFor={uploadId} className="round-button-text button--upload"> */}
                {/*         <span className="button"><img src="imgs/btn-med-upload@2x.png" alt="photo"/></span> */}
                {/*         <p>Încarcă o fotografie existentă<br/>*pdf, png, jpg, jpeg</p> */}
                {/*     </label> */}
                {/* </div> */}
            </div>
            <div className="row show-tablet">
                <label htmlFor={uploadId} className="round-button-text button--upload">
                    <div className="btn btn-doc-upload button--upload" href="#" onClick={enableCam}>
                        <div style={{
                            // padding: 16,
                            borderRadius: 4,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            display: 'flex',
                            gap: '20px'
                        }}>

                            <div style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Ping LCG', fontWeight: '700', textTransform: 'none', textAlign: 'start' }}>
                                Fotografiază documentul<br />folosind camera
                                <br />dizpozitivului
                            </div>
                            <div className="Action" style={{ width: 48, height: 48, position: 'relative' }}>
                                <span><img src={'svg/arrow_right.svg'} /></span>
                            </div>
                        </div>
                    </div>
                    {/* <span className="button"><img src="imgs/btn-med-photo@2x.png" alt="photo" /></span>
                    <p>Fotografiază documentul folosind camera dispozitivului<br />sau<br />încarcă o fotografie existentă<br />*pdf, png, jpg, jpeg</p> */}
                </label>
            </div>
            <DocList
                title="Documente încărcate"
                docs={docs}
                onDelete={handleDelete || handleDeleteDocImage}
            />
        </Fragment>

    );
};

UploadInteractionStep0.propTypes = propTypes;
UploadInteractionStep0.defaultProps = defaultProps;

export default UploadInteractionStep0;
