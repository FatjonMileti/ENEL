import moment from 'moment';
import { request } from './index.js';

export default {
    all: async (sortColumn, ascending) => {
        const url = `/ping?$limit=1000&$sort[${sortColumn}]=${ascending ? 1 : -1}`;
        return await request('GET', url);
    },
    stats: async (locationId, group, since, until) => {
        const url = `/ping?$limit=10000&locationId=${locationId}&receivedDate[$gte]=${moment(since).startOf('day').format('YYYYMMDD')}&receivedDate[$lt]=${moment(until).startOf('day').format('YYYYMMDD')}&$group=stats.${group}`;
        return await request('GET', url);
    },
};

