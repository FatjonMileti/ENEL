import moment from 'moment';
import { request } from './index.js';

export default {
    all: async () => {
        return await request('GET', `/company?$limit=5000`);
    }
};