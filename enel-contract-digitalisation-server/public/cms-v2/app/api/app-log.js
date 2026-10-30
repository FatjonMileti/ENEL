import moment from 'moment';
import { request } from './index.js';

export default {
    all: async (limit, skip, sortColumn, ascending, client, filters = []) => {
        let url = `/app-log?$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;

        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;

        return await request('GET', url);
    },
    add: async (data) => {
        return await request('POST', `/app-log`, data);
    },
};