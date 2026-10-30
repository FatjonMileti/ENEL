import moment from 'moment';
import { request } from './index.js';

export default {
    getLatest: async (client_app) => {
        const url = `/versions?client_app=${client_app}&$limit=1&$sort[createdAt]=-1`;
        return await request('GET', url);
    },
    post: async (data) => {
        return await request('POST', '/versions', data);
    },
};

