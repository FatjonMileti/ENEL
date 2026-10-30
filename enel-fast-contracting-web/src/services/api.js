import http from './http';
import auth from './auth';
import exception from './exception';
import mockAPI from './mockAPI';
import _ from 'lodash';
import { API_URL, MOCK_API } from 'utils/config';

const ApiService = {};

ApiService.get = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = API_URL + resource;

    if (MOCK_API) {
        const mockedData = mockAPI.get(resource, params);
        if (mockedData) return mockedData;
    }

    const [response, data] = await http.get(url, params, headers);
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

    if (MOCK_API) {
        const mockedData = mockAPI.post(resource, params);
        if (mockedData) return mockedData;
    }

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

    if (MOCK_API) {
        const mockedData = mockAPI.post(resource, params);
        if (mockedData) return mockedData;
    }

    const [response, data] = await http.postFiles(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.postFormData = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;

    if (MOCK_API) {
        const mockedData = mockAPI.patch(resource, params);
        if (mockedData) return mockedData;
    }

    const [response, data] = await http.postFormData(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.patchFormData = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };
    const url = `${API_URL}${resource}`;

    if (MOCK_API) {
        const mockedData = mockAPI.patch(resource, params);
        if (mockedData) return mockedData;
    }

    const [response, data] = await http.patchFormData(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

ApiService.postJSON = async (resource, params = {}, withResponse = false) => {
    const accessToken = await auth.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken.value}` };

    const url = `${API_URL}${resource}`;

    if (MOCK_API) {
        const mockedData = mockAPI.post(resource, params);
        if (mockedData) return mockedData;
    }

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

    if (MOCK_API) {
        const mockedData = mockAPI.put(resource, params);
        if (mockedData) return mockedData;
    }

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

    if (MOCK_API) {
        const mockedData = mockAPI.patch(resource, params);
        if (mockedData) return mockedData;
    }

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

    if (MOCK_API) {
        const mockedData = mockAPI.patch(resource, params);
        if (mockedData) return mockedData;
    }

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

    if (MOCK_API) {
        const mockedData = mockAPI.delete(resource, params);
        if (mockedData) return mockedData;
    }

    const [response, data] = await http.delete(url, params, headers);
    if (!response.ok) {
        throw data;
    }
    return withResponse ? [response, data] : data;
};

export default ApiService;
