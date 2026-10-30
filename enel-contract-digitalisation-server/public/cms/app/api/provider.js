import moment from 'moment';
import { request } from './index.js';

export default {
    all: async () => {
        return await request('GET', `/furnizor?$limit=5000&$sort[denumire]=1`);
    }
};