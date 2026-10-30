import api from 'services/api';

import { getSession } from 'store/session/selectors';
import { patch as patchSession } from 'store/session/actions';
import { getFlow } from 'store/client/selectors';
import { dataURLtoBlob } from 'utils';

export const types = {
    CLEAR_CACHE: 'ocr.CLEAR_CACHE',
    SET_ID: 'ocr.SET_ID',
    SET_INVOICE: 'ocr.SET_INVOICE',
    UNSET_ID: 'ocr.UNSET_ID',
    UNSET_INVOICE: 'ocr.UNSET_INVOICE',
};

export function ocrID(doc) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: types.UNSET_ID });
            const session = getSession(getState());
            const result = await api.postFiles(`/ocr?type=identity&sessionId=${session.id}`, { doc });

            dispatch({
                type: types.SET_ID,
                payload: {
                    id: result,
                },
            });
        } catch (e) {
            console.error(e);
        }
    };
}

export function ocrIDMultiple(images) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: types.UNSET_ID });
            const session = getSession(getState());

            // Convert images to blobs and create params object
            const params = {};
            for (let i = 0; i < images.length; i++) {
                const blob = dataURLtoBlob(images[i], 'image/png');
                if (i === 0) {
                    params.doc = blob;
                } else {
                    params[`doc${i + 1}`] = blob;
                }
            }

            const result = await api.postFiles(`/ocr?type=identity&sessionId=${session.id}`, params);

            dispatch({
                type: types.SET_ID,
                payload: {
                    id: result,
                },
            });
        } catch (e) {
            console.error(e);
        }
    };
}

export function ocrInvoice(images, pdf, type) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: types.UNSET_INVOICE });
            const session = getSession(getState());
            const flow = getFlow(getState()).toUpperCase();
            const imageParams = {};
            const pdfParams = {};
            let params;

            images.forEach((doc, index) => {
                doc = dataURLtoBlob(doc, 'image/png');
                if (index === 0) {
                    imageParams.doc = doc;
                } else {
                    imageParams[`doc${index + 1}`] = doc;
                }
            });

            if (pdf) {
                pdfParams.doc = dataURLtoBlob(pdf, 'application/pdf');
                params = pdfParams;
            } else {
                params = imageParams;
            }

            const result = await api.postFiles(`/ocr?type=bill&sessionId=${session.id}&billType=${type}&energyType=${flow.toUpperCase()}`, params);

            dispatch({
                type: types.SET_INVOICE,
                payload: {
                    invoice: result,
                },
            });
            dispatch(patchSession({
                _loc: {
                    cod_pod: '',
                    nlc: '',
                },
            }));
        } catch (e) {
            console.error(e);
        }

    };
}
