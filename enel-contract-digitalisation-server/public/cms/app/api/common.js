import { request } from './index.js';

/**
 *      endpoint    String['endPointName']              required,
 *      query       String[null, 'columnName=value']    notRequired,
 *      limit       Integer[null, 100]                  notRequired,
 *      skip        Integer[null, 0]                    notRequired,
 *      sortcolumn  String[null, 'columnName']          notRequired,
 *      asc         Bool[true ? 1 : -1]                 notRequired,
 *      select      Array[]                             notRequired
 **/

export default {
    get: async(endpoint, id) => {
        if (!endpoint) {
            throw `get endpoint is required.`;
        }
        return request('GET', `/${endpoint}/${id}`);
    },

    post: async(endpoint, form) => {
        if (!endpoint || !form) {
            throw `post argumenys are required.`;
        }
        return request('POST', `/${endpoint}`, form, true);
    },

    patch: async(endpoint, id, form) => {
        if (!endpoint || !form || !id) {
            throw `patch arguments are required`;
        }
        return request('PATCH', `/${endpoint}/${id}`, form, true);
    },

    find: async(endpoint,
            query = '',
            limit = 100,
            skip = 0,
            sortcolumn = null,
            asc = null,
            select = null) => {
            if (!endpoint) {
                throw `find endpoint is required.`;
            }

            return request('GET', `/${endpoint}?` +
                    (query ? `${query}&` : '') +
                    `$limit=${limit}` +
                    (skip ? `&$skip=${skip}` : '') +
                    (sortcolumn ? `&$sort[${sortcolumn}]=${asc?1:-1}` : '') +
                    (select ? `${select.reduce((acc, cur) => acc + `&$select[]=${cur}`, '')}` : '')
        )}
}