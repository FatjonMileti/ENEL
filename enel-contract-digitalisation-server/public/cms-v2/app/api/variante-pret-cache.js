import moment from 'moment';
import { request } from './index.js';
import _ from 'lodash';

export default {
    all: async (limit, skip, sortColumn, ascending) => {
        let url = `/variante-pret-cache?$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;
        return await request('GET', url);
    },

    runSyncMannual: async () => {
        let url = `/run-cron-job`;
        return await request('POST', url);
    },
    isSyncing: async () => {
        let url = `/variante-pret-loading`;
        return await request('GET', url);
    },

}
