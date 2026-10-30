import api from '../../services/api';
import _ from 'lodash';

import { getSession } from 'store/session/selectors';
import { getFlow } from 'store/client/selectors';
import { setFlow } from 'store/client/actions';

import offerService from 'services/offer';
import pageService from 'services/page';

export const types = {
    CLEAR_CACHE: 'session.CLEAR_CACHE',
    CREATE: 'session.CREATE',
    PATCH: 'session.PATCH',
    SET_STEP: 'session.SET_STEP',
    SET_COMPLETED: 'session.SET_COMPLETED',
    SET_PROVIDER: 'session.SET_PROVIDER',
    UNSET_PROVIDER: 'session.UNSET_PROVIDER',
    RESET: 'RESET_SESSION',
    RESTORE_SESSION: 'session.RESTORE_SESSION',
    CREATE_REGISTRATION_NUMBER_DONE: 'registration.CREATE_REGISTRATION_NUMBER_DONE',
};

export function clearCache() {
    return async (dispatch, getState) => {
        dispatch({
            type: types.CLEAR_CACHE,
        });
    };
    // {
    //     type: types.CLEAR_CACHE,
    // }

}

export function reset() {
    return {
        type: types.RESET,
    };
}

export function setStep(step) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.SET_STEP,
            payload: step,
        });
    };
}

export function setProvider(providerId) {
    return async (dispatch, getState) => {
        const flow = getFlow(getState());

        dispatch({
            type: types.SET_PROVIDER,
            payload: { flow: flow.toLowerCase(), providerId },
        });
    };
}

export function unsetProvider() {
    return async (dispatch, getState) => {
        const flow = getFlow(getState());

        dispatch({
            type: types.UNSET_PROVIDER,
            payload: { flow: flow.toLowerCase() },
        });
    };
}

export function patch(values) {
    return async (dispatch, getState) => {
        const flow = getFlow(getState());
        const data = _.cloneDeep(values);

        _.each(data, (value, key) => {
            if (key[0] == '_') {
                data[`${flow.toLowerCase()}${key}`] = value;
                delete data[key];
            }
        });

        dispatch({
            type: types.PATCH,
            payload: {
                session: data,
            },
        });

        const session = getSession(getState());
        await api.patchJSON(`/session/${session.id}`, session);
    };
}

export function create() {
    return async (dispatch, getState) => {
        const result = await api.post('/session', {});
        dispatch({
            type: types.PATCH,
            payload: {
                session: { id: result.id },
            },
        });
    };
}

export function restore(data) {
    return async (dispatch, getState) => {
        const { id, hash } = data;
        const result = await api.get(`/restore-session/${id}?hash=${hash}`);
        if (!result.page) {
            throw new Error('STEP_NOT_FOUND');
        }
        const lastPage = pageService.actions[result.page].page;
        const lastStep = pageService.getStepFromPage(lastPage);

        dispatch({
            type: types.RESTORE_SESSION,
            payload: {
                data: result.session,
                step: lastStep,
            },
        });

        dispatch({
            type: types.CREATE_REGISTRATION_NUMBER_DONE,
            payload: {
                registrationNumber: result.session.generic_dossier_id,
                registrationName: result.session.generic_dossier_name,
            },
        });
    };
}

export function createOffer(channel) {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        const flow = getFlow(getState()).toUpperCase();

        await api.patchJSON(`/session/${session.id}`, session);
        const result = await api.post(`/offer?sessionId=${session.id}&type=${flow}`);

        if (result.backoffice) {
            dispatch({
                type: types.PATCH,
                payload: {
                    session: {
                        backoffice: result.backoffice,
                        internal_id: result.internal_id,
                    },
                },
            });
        } else {
            await api.post(`/sign?sessionId=${session.id}&type=${flow}&contact=${channel}`);

            dispatch({
                type: types.PATCH,
                payload: {
                    session: {
                        internal_id: result.internal_id,
                    },
                },
            });
        }

        dispatch({
            type: types.SET_COMPLETED,
            payload: { flow: flow.toLowerCase() },
        });
    };
}

export function acceptOffer() {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        const flow = getFlow(getState()).toUpperCase();

        await api.post(`/activate?sessionId=${session.id}&type=${flow}`);
    };
}

export function rejectOffer() {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        const flow = getFlow(getState()).toUpperCase();

        await api.delete(`/activate?sessionId=${session.id}&type=${flow}`);
    };
}

export function setOptions(info) {
    const { furn24, judet, consum_anual_estimat, isBusiness, type } = info;
    return async (dispatch, getState) => {
        const session = getSession(getState());
        const options = {
            perioada_furnizare: parseInt(furn24) ? 24 : 12,
            judet,
            scadenta_factura: isBusiness ? 15 : 15,
            type,
            [`${type.toLowerCase()}_loc`]: {
                cantitate_anuala: consum_anual_estimat,
                ...session[`${type.toLowerCase()}_loc`],
            },
            contract_type: isBusiness ? 'b2b' : 'b2c',
        };

        dispatch({
            type: types.PATCH,
            payload: {
                session: options,
            },
        });
    };
}

export function setPlan(plan) {
    return async (dispatch, getState) => {
        const session = getSession(getState());
        const type = offerService.getPlanDetails(plan).serviciu;
        const flow = (type === 'GAZ') ? 'GAZ' : 'EE';

        const options = {
            ee_serviciu: _.find(plan, offer => offer.serviciu === 'EE') || null,
            gaz_serviciu: _.find(plan, offer => offer.serviciu === 'GAZ') || null,
            type: offerService.getPlanDetails(plan).serviciu,
        };

        dispatch(setFlow(flow));
        dispatch({
            type: types.PATCH,
            payload: {
                session: options,
            },
        });
    };
}
