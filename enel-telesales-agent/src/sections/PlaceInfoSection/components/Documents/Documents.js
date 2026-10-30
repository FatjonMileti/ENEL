import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';

import ImagesModal from 'components/modals/ImagesModal';
import ConfirmModal from 'components/modals/ConfirmModal';

const DEFAULT_TYPES = {
    FACT_CLIENT: 'Factura',
    ACT_PROPRIETAR: 'Act spaţiu',
    CER: 'Certificat Racordare',
    ATR: 'Aviz Tehnic de Racordare',
    DOC_ACORD_ACCES: 'Acord Acces',
    ALTELE: 'Alte Documente',
};

const B2BTYPES = {
    REGISTRATION_FISC_CERT: 'Certificat de inregistrare societate',
    IMPUTERNICIRE_OR_DOC_CONSTITUIVE:
        'Imputernicire/Certificat constator de la registrul comertului',
};

const Documents = ({ docs, options, onDelete, flow, isB2B }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const modals = {};
    const TYPES = isB2B ? B2BTYPES : DEFAULT_TYPES;
    _.each(TYPES, (label, docType) => {
        modals[docType] = React.useRef();
    });
    useEffect(() => {
        if (currentDoc && modals[currentDoc].current) {
            modals[currentDoc].current.modal.scrollTop =
                modals[currentDoc].current.modal.childNodes[currentPage].offsetTop - 80;
        }
    });

    const confirmModal = React.useRef();

    return (
        <Fragment>
            <ConfirmModal
                title="Esti sigur ca vrei sa stergi acest document?"
                confirmLabel="Sterge"
                dismissLabel="Anuleaza"
                ref={confirmModal}
                onConfirm={e => {
                    onDelete(currentDoc, flow);
                    setCurrentDoc(null);
                }}
            />
            {_.map(docs, (images, docType) => {
                const isLoading = options[docType] ? options[docType].isLoading : false;
                if (images && images.length) {
                    if (TYPES[docType]) {
                        return (
                            <Fragment key={docType}>
                                <ImagesModal
                                    images={images}
                                    show={showImageModal && currentDoc === docType}
                                    onHide={() => {
                                        setCurrentDoc(null);
                                        setShowImageModal(false);
                                    }}
                                    ref={modals[docType]}
                                />
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="group-name">
                                            {TYPES[docType]}
                                            <i
                                                className="ion-md-close delete-btn"
                                                onClick={() => {
                                                    setCurrentDoc(docType);
                                                    confirmModal.current.show();
                                                }}
                                            />
                                        </div>
                                        {isLoading && <div>Se alege imaginea...</div>}
                                        <div className="docs-wrapper">
                                            {_.map(images, (image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt=""
                                                    onClick={() => {
                                                        setCurrentPage(index);
                                                        setCurrentDoc(docType);
                                                        setShowImageModal(true);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        );
                    }
                }
            })}
        </Fragment>
    );
};

export default Documents;
