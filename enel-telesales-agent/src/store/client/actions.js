import api from '../../services/api';
import _ from 'lodash';

import { getFlow, getSession } from 'store/session/selectors';

export const types = {
    CLEAR_CACHE: 'client.CLEAR_CACHE',
    CLEAR_ERROR: 'client.CLEAR_ERROR',
    CLEAR_NLC: 'client.CLEAR_NLC',
    SET_CLIENT: 'client.SET_CLIENT',
    SET_START_DATE: 'client.SET_START_DATE',
    SET_NLC_VALIDATION: 'client.SET_NLC_VALIDATION',
    SET_NLC: 'client.SET_NLC',
    SET_OPTIONS: 'client.SET_OPTIONS',
    SET_LINK: 'client.SET_LINK',
    SET_ERROR: 'client.SET_ERROR',
    HAS_EMAIL: 'client.HAS_EMAIL',
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

export function setOptions(options) {
    return async (dispatch, getState) => {
        const flow = getFlow(getState());
        const data = _.cloneDeep(options);

        _.each(data, (value, key) => {
            if (key[0] === '_') {
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

export function checkCNP(value, type) {
    return async (dispatch, getState) => {
        try {
            const result = await api.get(`/client-info/${value}`, { type: type });
            dispatch({
                type: types.SET_CLIENT,
                payload: {
                    client: result,
                },
            });
        } catch (e) {
            dispatch({
                type: types.SET_CLIENT,
                payload: {
                    client: {},
                },
            });
        }
    };
}

export function checkNLC(nlc) {
    return async (dispatch, getState) => {
        try {
            const result = await api.get(`/info-nlc/${nlc}`);

            dispatch({
                type: types.SET_NLC,
                payload: {
                    nlc: { code: nlc, ...result },
                },
            });
        } catch (e) {
            dispatch({
                type: types.SET_NLC,
                payload: {
                    nlc: { code: nlc, status: 'NOK' },
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
                validation: { code: nlc, ...result },
            },
        });
    };
}

export function checkStartDate(options) {
    return async (dispatch, getState) => {
        const { startDate } = await api.get('/start-date', options);
        dispatch({
            type: types.SET_START_DATE,
            payload: {
                startDate,
            },
        });
    };
}

export function sendTestSMS() {
    return async (dispatch, getState) => {
        const { client } = getSession(getState());
        const recipient = client.telefon_mobil || client.telefon_fix;
        if (recipient) {
            console.log(`Send test SMS using web2sms to ${recipient}`);
            await api.patch(`/restore-session/${recipient}`);
        }
    };
}

export function sendSessionLink(sessionId, contact) {
    return async (dispatch, getState) => {
        const { id, hash } = await api.post('/restore-session', { sessionId, contact });
        dispatch({
            type: types.SET_LINK,
            payload: {
                link: `${process.env.REACT_APP_CLIENT_URL}/${id}/${hash}`,
            },
        });
    };
}

export function markIncompleteDocs(sessionId) {
    return async (dispatch, getState) => {
        await api.post('/incomplete-docs', { sessionId });
    };
}

export function setSessionLink({ id, hash }) {
    return async (dispatch, getState) => {
        dispatch({
            type: types.SET_LINK,
            payload: {
                link: `${process.env.REACT_APP_CLIENT_URL}/${id}/${hash}`,
            },
        });
    };
}

export const checkEmail = async (component, emailFieldName, formError) => {
    if (component.formApi) {
        const email = component.formApi.getState().values[emailFieldName];

        if (email) {
            const { id } = component.props.session;
            const checkEmail = await api.get(`/check-email/${email}?sessionId=${id}`);
            if (checkEmail.disposable) {
                return new Promise(resolve => {
                    component.setState(
                        {
                            formErrors: {
                                ...component.state.formErrors,
                                [formError]: [
                                    ...(component.state.formErrors[formError] || []),
                                    'E-mailul se afla in blacklist sau este disposable. Contractarea necesita un alt e-mail.',
                                ],
                            },
                        },
                        resolve
                    );
                });
            }
        }
    }
};

export const checkTel = async (component, phoneFieldName, formError) => {
    if (component.formApi) {
        const phone = component.formApi.getState().values[phoneFieldName];

        if (phone) {
            const { id } = component.props.session;
            const response = await api.get(`/blacklist/${phone}?fieldType=phone&sessionId=${id}`);
            if (response.status === 'BLOCKED') {
                return new Promise(resolve => {
                    component.setState(
                        {
                            formErrors: {
                                ...component.state.formErrors,
                                [formError]: [
                                    ...(component.state.formErrors[formError] || []),
                                    'Telefonul mobil se afla in blacklist. Contractarea necesita un alt numar de telefon.',
                                ],
                            },
                        },
                        resolve
                    );
                });
            }
        }
    }
};

export function validateEmail(email, sessionId) {
    return async (dispatch, getState) => {
        const result = await api.get(`/check-email/${email}?sessionId=${sessionId}`);
        if (result && result.disposable) {
            throw new Error('INVALID_EMAIL');
        }
    };
}

export function validatePhone(phone, sessionId) {
    return async (dispatch, getState) => {
        const result = await api.get(`/blacklist/${phone}?fieldType=phone&sessionId=${sessionId}`);
        if (result && result.status === 'BLOCKED') {
            throw new Error('INVALID_PHONE');
        }
    };
}

export const prevalidateEmailCfe = async (component, emailFieldName, formError) => {
    if (component.formApi) {
        const email = component.formApi.getState().values[emailFieldName];
        if (email) {
            const prevalidateEmailResult = await api.get(`/prevalidation-cfe?email=${email}`);

            if (prevalidateEmailResult.status === 'NOK') {
                return new Promise(resolve => {
                    component.setState(
                        {
                            formErrors: {
                                ...component.state.formErrors,
                                [formError]: [
                                    ...(component.state.formErrors[formError] || []),
                                    prevalidateEmailResult.message,
                                ],
                            },
                        },
                        resolve
                    );
                });
            }
        }
    }
};

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
