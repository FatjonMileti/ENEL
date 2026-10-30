import moment from 'moment';
import { request } from './index.js';

export default {
    all: async (sortColumn, ascending) => {
        const url = `/location?$limit=10000&$sort[${sortColumn}]=${ascending ? 1 : -1}`;
        return await request('GET', url);
    },
};

