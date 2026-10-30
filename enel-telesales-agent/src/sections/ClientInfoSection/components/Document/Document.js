import React, { Fragment, useState } from 'react';

import ImagesModal from 'components/modals/ImagesModal';
import ConfirmModal from 'components/modals/ConfirmModal';

const Document = ({ idImage, docSelection, onDelete }) => {
    let [showModal, setShowModal] = useState(false);

    const confirmModal = React.useRef();

    let content = (
        <div className="ci-wrapper">
            <span className="document-label">
                {docSelection ? 'Se incarca...' : 'Acte identificare'}
            </span>
        </div>
    );

    if (idImage) {
        content = (
            <Fragment>
                <ImagesModal
                    images={[idImage]}
                    show={showModal}
                    onHide={() => setShowModal(false)}
                />
                <div className="ci-wrapper">
                    <img src={idImage} alt="" onClick={() => setShowModal(true)} />
                    <i
                        className="ion-md-close delete-btn"
                        onClick={e => {
                            confirmModal.current.show();
                        }}
                    />
                </div>
            </Fragment>
        );
    }

    if (docSelection) {
        content = (
            <div className="ci-wrapper">
                <span className="document-label">Se alege imaginea...</span>
            </div>
        );
    }

    return (
        <Fragment>
            <ConfirmModal
                title="Esti sigur ca vrei sa stergi acest document?"
                confirmLabel="Sterge"
                dismissLabel="Anuleaza"
                ref={confirmModal}
                onConfirm={onDelete}
            />
            {content}
        </Fragment>
    );
};

export default Document;
