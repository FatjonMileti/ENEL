import { request,requestDoc } from './index.js';
import moment from 'moment';
import axios from 'axios'

const instance = axios.create({
    baseURL: `${window.location.origin}/`,
    timeout: 5000,
    headers: {
        "Content-Type": "application/form-data",
        "Authorization": `Bearer ${window.ACCESS_TOKEN}`
    }
});
instance.interceptors.response.use((response) => response, (error) => {
    return error;
});

export default {
    city: async () => {
        return await request('GET', '/judet');
    },
    getOffers: async ({city,duration,type} = {}) => {
        return await request('GET', `/variante-pret?judet=${city}&furn24=${duration}&serviciu=${type}&scadenta=15&canal=2`);
    },

    postDocuments: async(form) => {
       
        if (!form) {
            throw `post argumenys are required.`;
        }
        return instance.post(`/documentoffer?documentType=OFFER_DOCUMENT&type=OFFER`, form);
    },
    all: async (limit, skip, sortColumn, ascending) => {
        return await request('GET', `/users?$limit=${limit}&$skip=${skip}&$sort[${sortColumn}]=${ascending ? 1 : -1}`);
    },
    get: async (id) => request('GET', `/users/${id}`),
    allPersonalData: async () => {
        let limit = (await request('GET', `/users?$limit=0`)).total;
        return (await request('GET', `/users?$limit=${limit}&$select[]=id&&$select[]=firstName&$select[]=lastName&$select[]=workingRegion&$select[]=county&$select[]=city&$select[]=marca`)).data;
    },
};