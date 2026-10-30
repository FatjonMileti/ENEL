import _ from 'lodash';
import moment from 'moment';

class LocalStorageService {

    getState() {
        try {
            const serializedState = localStorage.getItem('state');
            if (serializedState === null) {
                return undefined;
            }
            return JSON.parse(serializedState);
        } catch (err) {
            return undefined;
        }
    }

    saveState(state) {
        try {
            const serializedState = JSON.stringify(state);
            localStorage.setItem('state', serializedState);
        } catch (err) {
            // Ignore write errors.
        }
    }
}

export default new LocalStorageService();
