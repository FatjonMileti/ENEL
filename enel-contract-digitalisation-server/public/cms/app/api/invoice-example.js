import moment from 'moment';
import { request, postFiles } from './index.js';
import _ from 'lodash';
import { buildQueryParams } from '../helpers/common.js';

export default {
    all: async (params) => {
        const url = `/invoice-examples` + buildQueryParams(params);
        return await request('GET', url);
    },
    post: async (file, params) => {
        const url = '/invoice-examples' + buildQueryParams(params);
        return await postFiles(url, { doc: file });
    },
    delete: async (id) => {
        await request('DELETE', `/invoice-examples/${id}`);
    }
};
