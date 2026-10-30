import exception from 'services/exception';
import * as authActions from '../auth/actions';

export const types = {
    PROCESS: 'exceptions.PROCESS',
    ADD: 'exceptions.ADD',
    CLEAR: 'exceptions.CLEAR',
};

export function clear() {
    return {
        type: types.CLEAR,
    };
}

export function add(e) {
    return {
        type: types.ADD,
        payload: { exception: e },
    };
}

export function process(e) {
    return (dispatch) => {
        if (exception.checkType(exception.types.VALIDATION, e)) {
            dispatch(add(e));
        } else if (exception.checkType(exception.types.INVALID_SESSION, e)) {
            dispatch(authActions.logout());
        } else if (exception.checkType(exception.types.INVALID_TOKEN, e)) {
            dispatch(authActions.logout());
        } else {
            console.error(e && e.stack);
        }
    };
}
