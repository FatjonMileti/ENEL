import moment from 'moment';
import { request } from './index.js';

export default {
    all: async () => {
        return await request('GET', `/canal?$limit=5000`);
    }
};