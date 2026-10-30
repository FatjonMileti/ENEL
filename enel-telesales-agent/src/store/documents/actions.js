import moment from 'moment';

import { blobToBase64, dataURLtoBlob } from '../../utils';
import api from 'services/api';
import file from 'services/file';

import { getSession } from 'store/session/selectors';
import { getTimestamps } from 'store/documents/selectors';
import { types as sessionTypes } from 'store/session/actions';

export const types = {
    CLEAR_CACHE: 'documents.CLEAR_CACHE',
    SET_DOC: 'documents.SET_DOC',
    SET_ID: 'documents.SET_ID',
    SET_TIMESTAMPS: 'documents.SET_TIMESTAMPS',
    SET_AGENT_SIGNATURE: 'documents.SET_AGENT_SIGNATURE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function setID(image) {
    return {
        type: types.SET_ID,
        payload: {
            image,
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

export function setAgentSignature(image) {
    return {
        type: types.SET_AGENT_SIGNATURE,
        payload: {
            image,
        },
    };
}

export function uploadAgentSignature(image) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blob = dataURLtoBlob(image, 'image/png');

        await api.postFiles(
            `/document?sessionId=${sessionId}&type=EE&documentType=SEMNATURA_AGENT`,
            {
                doc: blob,
            }
        );
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=GAZ&documentType=SEMNATURA_AGENT`,
            { doc: blob }
        );

        dispatch(setAgentSignature(image));
    };
}

export function setDoc(images, docType, flow) {
    return {
        type: types.SET_DOC,
        payload: {
            images,
            docType,
            flow: flow.toLowerCase(),
        },
    };
}

export function deleteDoc(docType, flow) {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        await api.delete(
            `/uploaded/${id}/${hash}?type=${flow.toUpperCase()}&documentType=${docType}`
        );
    };
}

export function checkDocs() {
    return async (dispatch, getState) => {
        const { id } = getSession(getState());
        if (id) {
            const { ee, gaz, session } = await api.patch(`/document/${id}?sessionId=${id}`);
            const timestamps = getTimestamps(getState());

            const flows = { ee, gaz };
            for (let flow in flows) {
                const docs = flows[flow];
                for (let docType in docs) {
                    const time = docs[docType];
                    if (
                        !timestamps[flow] ||
                        !timestamps[flow][docType] ||
                        moment(time).isAfter(moment(timestamps[flow][docType]))
                    ) {
                        if (docType === 'CI') {
                            await dispatch(fetchID());
                        } else if (docType !== 'SEMNATURA_CLI') {
                            await dispatch(fetchDocs(flow, docType));
                        }
                    }
                }
            }

            dispatch({
                type: types.SET_TIMESTAMPS,
                payload: {
                    timestamps: { ee, gaz },
                },
            });
            dispatch({
                type: sessionTypes.PATCH,
                payload: {
                    session,
                },
            });
        }
    };
}

export function fetchID() {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        try {
            const blob = await api.getFile(`/uploaded/${id}/${hash}?type=EE&documentType=CI`);
            const image = await blobToBase64(blob, 'image/jpeg');
            dispatch(setID(image));
        } catch (error) {
            dispatch(setID(null));
        }
    };
}

export function fetchAgentSignature() {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        try {
            const blob = await api.getFile(
                `/uploaded/${id}/${hash}?type=EE&documentType=SEMNATURA_AGENT`
            );
            const image = await blobToBase64(blob, 'image/jpeg');
            dispatch(setAgentSignature(image));
        } catch (error) {
            dispatch(setAgentSignature(null));
        }
    };
}

export function fetchDocs(flow, docType) {
    return async (dispatch, getState) => {
        const { id, hash } = getSession(getState());
        try {
            const blob = await api.getFile(
                `/uploaded/${id}/${hash}?type=${flow.toUpperCase()}&documentType=${docType}`
            );
            const data = await blobToBase64(blob, 'application/pdf');
            const images = await file.convertPDFToImages(data);
            dispatch(setDoc(images, docType, flow));
        } catch (e) {
            dispatch(setDoc([], docType, flow));
        }
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

        if (type === 'ACT_PROPRIETAR') {
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

export function checkSigned(offerType) {
    return async (dispatch, getState) => {
        const { id } = getSession(getState());

        if (id) {
            const res = await api.get(`/docout/${id}?sessionId=${id}&type=${offerType}`);
            return res;
        }

        return false;
    };
}
