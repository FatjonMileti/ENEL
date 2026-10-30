import api from '../../services/api';
import file from 'services/file';
import { dataURLtoBlob, blobToBase64 } from '../../utils';

import { getSession } from 'store/session/selectors';

export const types = {
    CLEAR_CACHE: 'documents.CLEAR_CACHE',
    SET_GENERATED_DOCS: 'documents.SET_GENERATED_DOCS',
    SET_OWNER_DOCS: 'documents.SET_OWNER_DOCS',
    SET_ID: 'documents.SET_ID',
    SET_SIGNATURE: 'documents.SET_SIGNATURE',
    SET_DOC: 'documents.SET_DOC',
};

export function setID(image) {
    return {
        type: types.SET_ID,
        payload: {
            image,
        },
    };
}

export function setSignature(image) {
    return {
        type: types.SET_SIGNATURE,
        payload: {
            image,
        },
    };
}

export function setDoc(images, docType, flow) {
    return {
        type: types.SET_DOC,
        payload: {
            images,
            docType,
            flow,
        },
    };
}

export function unsetID() {
    return {
        type: types.SET_ID,
        payload: {
            image: null,
        },
    };
}

export function uploadSignature(image) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blob = dataURLtoBlob(image, 'image/png');

        await api.postFiles(`/document?sessionId=${sessionId}&type=EE&documentType=SEMNATURA_CLI`, {
            doc: blob,
        });
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=GAZ&documentType=SEMNATURA_CLI`,
            { doc: blob }
        );

        dispatch(setSignature(image));
    };
}

export function uploadID(image) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blob = dataURLtoBlob(image, 'image/png');

        await api.postFiles(`/document?sessionId=${sessionId}&type=EE&documentType=CI`, {
            doc: blob,
        });
        await api.postFiles(`/document?sessionId=${sessionId}&type=GAZ&documentType=CI`, {
            doc: blob,
        });

        dispatch(setID(image));
    };
}

export function uploadRegistrationFisc(images, type) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blobs = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            blobs.push(dataURLtoBlob(image, 'image/png'));
        }
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=EE&documentType=REGISTRATION_FISC_CERT`,
            {
                doc: blobs,
            }
        );
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=GAZ&documentType=REGISTRATION_FISC_CERT`,
            {
                doc: blobs,
            }
        );

        dispatch(setDoc(images, 'REGISTRATION_FISC_CERT', type.toLowerCase()));
    };
}

export function uploadPowerOfAttorneyOrReg(images, type) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blobs = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            blobs.push(dataURLtoBlob(image, 'image/png'));
        }

        await api.postFiles(
            `/document?sessionId=${sessionId}&type=EE&documentType=IMPUTERNICIRE_OR_DOC_CONSTITUIVE`,
            {
                doc: blobs,
            }
        );
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=GAZ&documentType=IMPUTERNICIRE_OR_DOC_CONSTITUIVE`,
            {
                doc: blobs,
            }
        );

        dispatch(setDoc(images, 'IMPUTERNICIRE_OR_DOC_CONSTITUIVE', type.toLowerCase()));
    };
}

export function uploadInvoice(images, type) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blobs = [];

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            blobs.push(dataURLtoBlob(image, 'image/png'));
        }

        /* eslint-disable */
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=${type}&documentType=FACT_CLIENT`,
            { doc: blobs }
        );

        dispatch(setDoc(images, 'FACT_CLIENT', type.toLowerCase()));
    };
}

export function uploadOwnerDocs(images, type, flow) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blobs = [];
        for (let j = 0; j < images.length; j++) {
            const image = images[j];
            blobs.push(dataURLtoBlob(image, 'image/png'));
        }

        if (type == 'ACT_PROPRIETAR') {
            await api.postFiles(`/document?sessionId=${sessionId}&type=EE&documentType=${type}`, {
                doc: blobs,
            });
            await api.postFiles(`/document?sessionId=${sessionId}&type=GAZ&documentType=${type}`, {
                doc: blobs,
            });
        } else {
            await api.postFiles(
                `/document?sessionId=${sessionId}&type=${flow}&documentType=${type}`,
                {
                    doc: blobs,
                }
            );
        }
    };
}

export function deleteDoc(docType, flow) {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        await api.delete(`/uploaded/${id}/${hash}?type=${flow}&documentType=${docType}`);
    };
}

export function fetchID() {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        try {
            const blob = await api.getFile(`/uploaded/${id}/${hash}?type=EE&documentType=CI`);
            const image = await blobToBase64(blob, 'image/jpeg');
            dispatch(setID(image));
        } catch (err) {}
    };
}

export function fetchSignature() {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        const blob = await api.getFile(
            `/uploaded/${id}/${hash}?type=EE&documentType=SEMNATURA_CLI`
        );
        const image = await blobToBase64(blob, 'image/jpeg');
        dispatch(setSignature(image));
    };
}

export function fetchDocs(flow, docType) {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        try {
            const blob = await api.getFile(
                `/uploaded/${id}/${hash}?type=${flow}&documentType=${docType}`
            );
            const data = await blobToBase64(blob, 'application/pdf');
            const images = await file.convertPDFToImages(data);
            dispatch(setDoc(images, docType, flow.toLowerCase()));
        } catch (e) {
            dispatch(setDoc([], docType, flow.toLowerCase()));
        }
    };
}

export function fetchGeneratedDocs(flow) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const docs = await api.get(`/document/${sessionId}?type=${flow}`);
        dispatch({
            type: types.SET_GENERATED_DOCS,
            payload: {
                docs,
                flow: flow.toLowerCase(),
            },
        });
    };
}
