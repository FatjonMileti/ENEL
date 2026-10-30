import api from '../../services/api';
import { dataURLtoBlob } from 'utils';
import _ from 'lodash';

import { getSession } from 'store/session/selectors';
import { getFlow } from 'store/client/selectors';

export const types = {
    CLEAR_CACHE: 'documents.CLEAR_CACHE',
    SET_GENERATED_DOCS: 'documents.SET_GENERATED_DOCS',
    SET_OWNER_DOCS: 'documents.SET_OWNER_DOCS',
    SET_BUSINESS_ID_DOCS: 'documents.SET_BUSINESS_ID_DOCS',
    SET_ID: 'documents.SET_ID',
    SET_INVOICE: 'documents.SET_INVOICE',
};


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

export function uploadSignature(image) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blob = dataURLtoBlob(image, 'image/png');

        await api.postFiles(
            `/document?sessionId=${sessionId}&type=EE&documentType=SEMNATURA_CLI`,
            { doc: blob }
        );
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=GAZ&documentType=SEMNATURA_CLI`,
            { doc: blob }
        );
    };
}

export function uploadID(image) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const blob = dataURLtoBlob(image, 'image/png');

        await api.postFiles(
            `/document?sessionId=${sessionId}&type=EE&documentType=CI`,
            { doc: blob }
        );
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=GAZ&documentType=CI`,
            { doc: blob }
        );

        dispatch(setID(image));
    };
}

export function uploadIDWithSide(images, documentType) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const blob = dataURLtoBlob(image, 'image/png');
            const side = i === 0 ? 'FRONT' : 'BACK';

            await api.postFiles(
                `/document?sessionId=${sessionId}&type=EE&documentType=${documentType}&side=${side}`,
                { doc: blob }
            );
            await api.postFiles(
                `/document?sessionId=${sessionId}&type=GAZ&documentType=${documentType}&side=${side}`,
                { doc: blob }
            );
        }

        dispatch(setID(images[0])); // Store first image for display
    };
}

export function uploadAddressCertificate(images) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;

        const blobs = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            blobs.push(dataURLtoBlob(image, 'image/png'));
        }

        await api.postFiles(
            `/document?sessionId=${sessionId}&type=EE&documentType=CERTIFICAT_DOMICILIU`,
            { doc: blobs }
        );
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=GAZ&documentType=CERTIFICAT_DOMICILIU`,
            { doc: blobs }
        );
    };
}

export function uploadInvoice(images, pdf) {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const flow = getFlow(getState()).toUpperCase();

        const blobs = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            blobs.push(
                dataURLtoBlob(image, 'image/png')
            );
        }

        /* eslint-disable */
        await api.postFiles(
            `/document?sessionId=${sessionId}&type=${flow}&documentType=FACT_CLIENT`,
            { doc: blobs }
        );

        dispatch({
            type: types.SET_INVOICE,
            payload: {
                images,
                pdf,
                flow,
            },
        });
    };
}

async function uploadDocs(docs, flow, sessionId) {
    const fileTypes = Object.keys(docs);

    for (let i = fileTypes.length - 1; i >= 0; i--) {
        const type = fileTypes[i];
        const doc = docs[type];
        const blobs = [];
        for (let j = 0; j < doc.images.length; j++) {
            const image = doc.images[j];
            blobs.push(
                dataURLtoBlob(image, 'image/png')
            );
        }

        /* eslint-disable */
        try {
            await api.postFiles(
                `/document?sessionId=${sessionId}&type=${flow}&documentType=${type}`,
                { doc: blobs }
            );
        } catch (err) { }
    }
}

export function uploadOwnerDocs(docs) {
    return async (dispatch, getState) => {
        const flow = getFlow(getState()).toUpperCase();
        const sessionId = getSession(getState()).id;
        await uploadDocs(docs, flow, sessionId);

        dispatch({
            type: types.SET_OWNER_DOCS,
            payload: {
                docs,
                flow,
            },
        });
    };
}

export function uploadBusinessIdDocs(docs) {
    return async (dispatch, getState) => {
        const flow = getFlow(getState()).toUpperCase();
        const sessionId = getSession(getState()).id;
        await uploadDocs(docs, flow, sessionId);

        dispatch({
            type: types.SET_BUSINESS_ID_DOCS,
            payload: {
                docs,
                flow,
            },
        });
    };
}

export function fetchGeneratedDocs() {
    return async (dispatch, getState) => {
        const sessionId = getSession(getState()).id;
        const flow = getFlow(getState()).toUpperCase();
        const docs = await api.get(`/document/${sessionId}?type=${flow}`);

        dispatch({
            type: types.SET_GENERATED_DOCS,
            payload: {
                docs,
            },
        });
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