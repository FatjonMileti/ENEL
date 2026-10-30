import api from '../../services/api';
import _ from 'lodash';
import ValidationException from 'services/exceptions/validation';

import { getSession } from 'store/session/selectors';
import { getFlow } from 'store/client/selectors';
import { WEB_APP } from 'utils/config';

export const types = {
    CLEAR_CACHE: 'client.CLEAR_CACHE',
    CLEAR_ERROR: 'client.CLEAR_ERROR',
    CLEAR_NLC: 'client.CLEAR_NLC',
    SET_CLIENT: 'client.SET_CLIENT',
    SET_NLC_VALIDATION: 'client.SET_NLC_VALIDATION',
    SET_NLC: 'client.SET_NLC',
    SET_FLOW: 'client.SET_FLOW',
    SET_OPTIONS: 'client.SET_OPTIONS',
    SET_ERROR: 'client.SET_ERROR',
    HAS_EMAIL: 'client.HAS_EMAIL',
    MARK_STEP: 'client.MARK_STEP',
    SET_START_DATE: 'client.SET_START_DATE',
};

export function clearCache() {
    return {
        type: types.CLEAR_CACHE,
    };
}

export function clearError() {
    return {
        type: types.CLEAR_ERROR,
    };
}

export function clearNLC() {
    return {
        type: types.CLEAR_NLC,
    };
}

export function setFlow(flow) {
    return {
        type: types.SET_FLOW,
        payload: {
            flow,
        },
    };
}

export function setOptions(options) {
    return async (dispatch, getState) => {
        const flow = getFlow(getState());
        const data = _.cloneDeep(options);

        _.each(data, (value, key) => {
            if (key[0] == '_') {
                data[`${flow.toLowerCase()}${key}`] = value;
                delete data[key];
            }
        });

        dispatch({
            type: types.SET_OPTIONS,
            payload: {
                options: data,
            },
        });
    };
}

export function setError(error) {
    return {
        type: types.SET_ERROR,
        payload: {
            error,
        },
    };
}

export function hasEmail(hasEmail) {
    return {
        type: types.HAS_EMAIL,
        payload: {
            hasEmail,
        },
    };
}

export function checkCNP(params) {
    return async (dispatch, getState) => {
        try {
            const session = getSession(getState());
            const result = await api.post(
                `/client-info?sessionId=${session.id}`,
                params
            );

            if (result.code && result.code >= 400) {
                throw new ValidationException('NOT_FOUND');
            }

            dispatch({
                type: types.SET_CLIENT,
                payload: {
                    client: result,
                },
            });
        } catch (e) {
            throw new ValidationException('ERROR');
        }
    };
}

export function checkCNPCaptcha(params) {
    return async (dispatch, getState) => {
        try {
            const session = getSession(getState());
            const result = await api.post(
                `/client-info?sessionId=${session.id}`,
                params
            );

            if (result.code && result.code >= 400) {
                throw new ValidationException('NOT_VALID');
            }

            dispatch({
                type: types.HAS_EMAIL,
                payload: {
                    hasEmail: result.email,
                },
            });

            // captcha token is valid
        } catch (e) {
            throw new ValidationException('PROCESS_CNP_ERROR');
        }
    };
}

export function checkNLC(nlc, code) {
    return async (dispatch, getState) => {
        try {
            const result = await api.get(`/info-nlc/${nlc}?code=${code}`);

            dispatch({
                type: types.SET_NLC,
                payload: {
                    nlc: result,
                },
            });
        } catch (e) {
            dispatch({
                type: types.SET_NLC,
                payload: {
                    nlc: { status: 'NOK' },
                },
            });
        }
    };
}

export function validateNLC(nlc) {
    return async (dispatch, getState) => {
        const result = await api.get(`/validate-nlc/${nlc}`);
        dispatch({
            type: types.SET_NLC_VALIDATION,
            payload: {
                validation: result,
            },
        });
    };
}

export function markAction(action) {
    return async (dispatch, getState) => {
        const session = getSession(getState());

        const result = await api.post('/app-log', {
            client: WEB_APP,
            sessionId: session.id,
            type: 'PAGE',
            page: action,
        });
    };
}

export function sendSessionLink(email) {
    return async (dispatch, getState) => {
        await api.post('/restore-session', { email });
    };
}

export function checkOfferStatus(cnp, email, phone, contractType) {
    return async (dispatch, getState) => {
        const result = await api.get(
            `/check-status?cnp=${cnp}&email=${email}&phone=${phone}&contractType=${contractType}`
        );
        if (result && result.status !== 'OK') {
            throw new Error('LIMIT_REACHED');
        }
    };
}

export function prevalidateEmailCfe(type, value) {
    return async (dispatch, getState) => {
        const prevalidateEmailResult = await api.get(`/prevalidation-cfe?${type}=${value}`);
        if (prevalidateEmailResult && prevalidateEmailResult.status === 'NOK') {
            throw new Error(prevalidateEmailResult.message);
        }
    };
}

export function getProviderStartDate(options) {
    return async (dispatch) => {
        let getProviderStartDateResult;
        try {
            getProviderStartDateResult = await api.get(`/start-date?type=${options.type}&isEnelCounty=${options.isEnelCounty}&changeProvider=${options.changeProvider}&changeOwner=${options.changeOwner}&cui=${options.cui}&isWinback=${options.isWinback}&isPR=${options.isWinback}`);
            if (getProviderStartDateResult && getProviderStartDateResult.startDate) {
                dispatch({
                    type: types.SET_START_DATE,
                    payload: {
                        startDate: getProviderStartDateResult.startDate,
                    },
                });
            }
        } catch (e) {
            if (!getProviderStartDateResult) {
                throw new Error('Eroare calcul data start furnizare.');
            }
        }
    };
}
