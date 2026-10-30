import moment from 'moment';
import { request } from './index.js';

export default {
    countAllSince: async (since, until) => {
        if (until) {
            let limit = (await request('GET', `/session?$limit=0&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&createdAt[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}`)).total;
            return await request('GET', `/session?$limit=${limit}&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&createdAt[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}`);
        }

        let limit = (await request('GET', `/session?$limit=0&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}`)).total;
        return await request('GET', `/session?$limit=${limit}&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}`);
    },
    all: async (limit, skip, sortColumn, ascending, client_app, filters = []) => {
        let url = `/session?client_app=${client_app}&$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;

        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;
        
        return await request('GET', url);
    },
    countClosed: async (client_app, filters = []) => {
        let url = `/session?client_app=${client_app}&is_closed=true&$limit=0`;

        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;
        
        return (await request('GET', url)).total;
    },
    countActivatedTrue: async (client_app, filters = []) => {
        let url = `/session?client_app=${client_app}&$limit=0&$or[0][ee_agree]=true&$or[0][type]=EE&$or[1][gaz_agree]=true&$or[1][type]=GAZ&$or[2][type]=COMBO&$or[2][ee_agree]=true&$or[2][gaz_agree]=true`;

        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;
        
        return (await request('GET', url)).total;
    },

    countToday: async (client_app) => {
        let data = { total: 0 };
        if (client_app)
            data = await request('GET', `/session?client_app=${client_app}&$limit=0&createdAt[$gte]=${moment().startOf('day').format('YYYYMMDD')}`);
        else
            data = await request('GET', `/session?$limit=0&createdAt[$gte]=${moment().startOf('day').format('YYYYMMDD')}`);
        return data.total;
    },
    countWeek: async (client_app) => {
        let data = { total: 0 };
        if (client_app)
            data = await request('GET', `/session?client_app=${client_app}&$limit=0&createdAt[$gte]=${moment().startOf('week').format('YYYYMMDD')}`);
        else
            data = await request('GET', `/session?$limit=0&createdAt[$gte]=${moment().startOf('week').format('YYYYMMDD')}`);
        return data.total;
    },
    countMonth: async (client_app) => {
        let data = { total: 0 };
        if (client_app)
            data = await request('GET', `/session?client_app=${client_app}&$limit=0&createdAt[$gte]=${moment().startOf('month').format('YYYYMMDD')}`);
        else
            data = await request('GET', `/session?$limit=0&createdAt[$gte]=${moment().startOf('month').format('YYYYMMDD')}`);
        return data.total;
    },
    details: async (id) => {
        const data = await request('GET', `/session/${id}`);
        return data;
    }
};