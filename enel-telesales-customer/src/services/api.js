import http from './http';
import auth from './auth';

const ApiService = {};
const API_URL = process.env.REACT_APP_API_URL;

ApiService.get = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = API_URL + resource;
    const [response, data] = await http.get(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.getFile = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = API_URL + resource;
    const [response, data] = await http.getFile(url, params, headers);

    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.post = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = {
        Authorization: `Bearer ${accessToken.value}`,
    };
    const url = `${API_URL}${resource}`;
    const [response, data] = await http.post(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.postFiles = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;
    const [response, data] = await http.postFiles(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.postJSON = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;
    const [response, data] = await http.postJSON(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.put = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;
    const [response, data] = await http.put(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.patch = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;
    const [response, data] = await http.patch(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.patchJSON = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;
    const [response, data] = await http.patchJSON(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.delete = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;
    const [response, data] = await http.delete(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

export default ApiService;
