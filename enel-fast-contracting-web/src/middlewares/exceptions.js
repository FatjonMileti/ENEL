import * as exceptionsActions from 'store/exceptions/actions';

/**
 * Middleware for intercepting and handling exceptions
 * thrown by actions dispatching.
 */
const exceptions = ({ dispatch }) => next => (action) => {
    if (typeof action === 'function') {
        return new Promise((resolve, reject) => {
            const promise = next(action);
            if (promise && promise.then) {
                promise.then(() => {
                    dispatch(exceptionsActions.clear());
                    resolve();
                }, (e) => {
                    dispatch(exceptionsActions.process(e));
                    reject(e);
                });
            }
        });
    }

    return next(action);
};

export default exceptions;
