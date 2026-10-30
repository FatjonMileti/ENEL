import { request } from './index.js';
import moment from 'moment';

export default {
    sessions: async (limit, skip, sortColumn, ascending, id, filters = []) => {
        let url = `/session?agent_id=${id}&$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;

        for (const filter of filters) 
            url += `&${filter.column}=${filter.value}`;
        
        return await request('GET', url);
    },
    info: async () => {
        return await request('GET', '/user-info');
    },
    all: async (limit, skip, sortColumn, ascending) => {
        return await request('GET', `/users?$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`);
    },
    get: async (id) => request('GET', `/users/${id}`),
    allPersonalData: async () => {
        let limit = (await request('GET', `/users?$limit=0`)).total;
        return (await request('GET', `/users?$limit=${limit}&$select[]=id&&$select[]=firstName&$select[]=lastName&$select[]=workingRegion&$select[]=county&$select[]=city&$select[]=marca`)).data;
    }
};