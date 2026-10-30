import moment from 'moment';
import { request } from './index.js';
import _ from 'lodash';

export default {
    all: async () => {
        let url = `/whitelist`;
        return await request('GET', url);
    },

    add: async (form) => {
        if (!form) {
            throw `post arguments are required.`;
        }

        return await request('POST', `/whitelist`, form );
    },

    patch: async (id, form) => {
        if (!form && !id) {
            throw `patch arguments are required.`;
        }

        return await request('PATCH', `/whitelist/${id}`, form );
    },
    delete: async (id) => {
        return await request('DELETE', `/whitelist/${id}`);
    },
}