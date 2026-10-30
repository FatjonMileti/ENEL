import moment from 'moment';
import { request } from './index.js';
import _ from 'lodash';

export default {
    all: async (limit, skip, sortColumn, ascending, filters = []) => {
        let url = `/query-report?$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;
        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;
        
        return await request('GET', url);
    }
}