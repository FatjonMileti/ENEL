import moment from 'moment';
import { request } from './index.js';
import _ from 'lodash';

export default {
    all: async () => {
        let url = `/blacklist`;
        return await request('GET', url);
    },

    add: async (form) => {
        if (!form) {
            throw `post arguments are required.`;
        }

        return await request('POST', `/blacklist`, form );
    },

    delete: async (id) => {
        return await request('DELETE', `/blacklist/${id}`);
    },
}