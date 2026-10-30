import { request } from './index.js';
import moment from 'moment';

export default {
    //agent sessions
    countClosed: async (id, filters = []) => {
        let url = `/session?agent_id=${id}&is_closed=true&$limit=0`;

        for (const filter of filters) 
            url += `&${filter.column}=${filter.value}`;
        
        return (await request('GET', url)).total;
    },
    countActivatedTrue: async (id, filters = []) => {
        let url = `/session?agent_id=${id}&$limit=0&$or[0][ee_agree]=true&$or[0][type]=EE&$or[1][gaz_agree]=true&$or[1][type]=GAZ&$or[2][type]=COMBO&$or[2][ee_agree]=true&$or[2][gaz_agree]=true`;

        for (const filter of filters) 
            url += `&${filter.column}=${filter.value}`;
        
        return (await request('GET', url)).total;
    },
    sessions: async (limit, skip, sortColumn, ascending, id, filters = []) => {
        let url = `/session?agent_id=${id}&$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;

        for (const filter of filters) 
            url += `&${filter.column}=${filter.value}`;
        
        return await request('GET', url);
    },

    info: async () => {
        return await request('GET', '/user-info');
    },
    countOnline: async () => {
        const data = await request('GET',
            `/users?$limit=0` +
            `&role=user` +
            `&lastLogin[$gt]=${moment().startOf('day').format('YYYYMMDD')}`);
        return data.total;
    },
    count: async () => {
        const data = await request('GET',
            `/users?$limit=0` +
            `&role=user`);
        return data.total;
    },
    countActive: async () => {
        const data = await request('GET',
            `/session?$select[]=agent_id` +
            `&updatedAt[$gt]=${moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}`);
        let agentCount = data.data.map(x => x.agent_id).filter((value, index, self) => {
            return self.indexOf(value) === index;
        }).length;

        return agentCount;
    },
    isActive: async (id) => {
        const data = await request('GET',
            `/session?agent_id=${id}` +
            `&updatedAt[$gt]=${moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}`);
        return data.total > 0;
    },
    countToday: async (id) => {
        let data = { total: 0 };
        data = await request('GET',
            `/session?$limit=0` +
            `&agent_id=${id}` +
            `&createdAt[$gte]=${moment().startOf('day').format('YYYYMMDD')}`);
        return data.total;
    },
    countWeek: async (id) => {
        let data = { total: 0 };
        data = await request('GET',
            `/session?$limit=0` +
            `&agent_id=${id}` +
            `&createdAt[$gte]=${moment().startOf('week').format('YYYYMMDD')}`);
        return data.total;
    },
    countMonth: async (id) => {
        let data = { total: 0 };
        data = await request('GET',
            `/session?$limit=0` +
            `&agent_id=${id}` +
            `&createdAt[$gte]=${moment().startOf('month').format('YYYYMMDD')}`);
        return data.total;
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