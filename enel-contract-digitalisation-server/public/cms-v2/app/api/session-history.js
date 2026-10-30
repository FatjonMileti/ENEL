import moment from 'moment';
import { request } from './index.js';
import _ from 'lodash';

export default {
    countAllSince: async (since, until) => {
        if (until) {
            let limit = (await request('GET', `/session-history?$limit=0&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&createdAt[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}`)).total;
            return await request('GET', `/session-history?$limit=${limit}&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&createdAt[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}`);
        }

        let limit = (await request('GET', `/session-history?$limit=0&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}`)).total;
        return await request('GET', `/session-history?$limit=${limit}&createdAt[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}`);
    },
    all: async (limit, skip, sortColumn, ascending, filters = []) => {
        let url = `/session-history?$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;

        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;

        return await request('GET', url);
    },
    pod: async (limit, skip, sortColumn, ascending, filters = []) => {
        let url = `/check-pod?$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`;

        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;

        return await request('GET', url);
    },
    map: async (filters = []) => {
        let url = `/session-history?$limit=100000&$select[]=id&$select[]=location_lat&$select[]=location_long`;

        for (const filter of filters)
            url += `&${filter.column}=${filter.value}`;

        return await request('GET', url);
    },
    count: async (clientApp, filters = []) => {
        let url = `/session-history?$limit=5`;
        if (clientApp) {
            url += `&client_app=${clientApp}`;
            filters = filters.filter(item => !item.column.match('client_app'));
        }

        for (const filter of filters) {
            url += `&${filter.column}=${filter.value}`;
        }

        return (await request('GET', url)).total;
    },
    countGrouped: async (group, clientApp, filters = []) => {
        let url = `/session-history?$group=${group}`;
        if (clientApp) {
            url += `&client_app=${clientApp}`;
            filters = filters.filter(item => !item.column.match('client_app'));
        }

        for (const filter of filters) {
            url += `&${filter.column}=${filter.value}`;
        }

        return (await request('GET', url)).data;
    },
    details: async (id) => {
        const data = await request('GET', `/session-history/${id}`);
        return data;
    },
};
