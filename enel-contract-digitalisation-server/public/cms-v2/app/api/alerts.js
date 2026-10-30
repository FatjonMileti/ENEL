import moment from 'moment';
import { request } from './index.js';

export default {
    all: async () => {
        return await request('GET', `/alerts`);
    },
    update: async (id, data) => {
        return await request('PATCH', `/alerts/${id}`, data);
    },
};