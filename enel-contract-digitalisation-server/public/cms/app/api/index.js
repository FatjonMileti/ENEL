import app_log from './app-log.js';
import user from './user.js';
import session from './session.js';
import common from './common.js';
import tipcanal from './tip-canal.js';
import distribuitor from './distribuitor.js';
import invoice_example from './invoice-example.js';
import canal from './canal.js';
import county from './county.js';
import provider from './provider.js';
import versions from './versions.js';

export default {
    app_log,
    common,
    user,
    session,
    tipcanal,
    distribuitor,
    invoice_example,
    canal,
    county,
    provider,
    versions,
};

export const logout = () => {
    window.location.href = `${window.location.origin}/cms/login`;
};

/**
 * Sign request and auto-logout
 * @param {string} verb GET, POST, PUT, DELETE ... 
 * @param {string} url Ex:/endpoint, the base path is included by default
 * @param {object} [body] 
 */
export const request = async (verb = 'GET', url, body = undefined, withResp = false) => {
    let token = window.ACCESS_TOKEN;
    if (!token || token == 'undefined') {
        console.error('window.ACCESS_TOKEN === undefined; logging out...');
        return logout();
    }

    // body data type must match "Content-Type" header
    // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options
    const response = await fetch(`${window.location.origin}${url}`, {
        credentials: 'include',
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            'Authorization': `Bearer ${token}`
        },
        method: verb,
        body: JSON.stringify(body)
    });

    if (!withResp) {
        if (!response.ok && response.url !== `${window.location.origin}/change-password`) {
            if ([401, 403, 405].indexOf(response.status) !== -1) {
                console.error('401 response from server. logging out...');
                return logout();
            }

            console.error('unexpected response from server', response.status);
            return null;
        }
    }

    return await response.json();
};

export const postFiles = async (url, files) => {
    let token = window.ACCESS_TOKEN;
    if (!token || token == 'undefined') {
        console.error('window.ACCESS_TOKEN === undefined; logging out...');
        return logout();
    }

    const formData = new FormData();
    for (const key in files) {
        formData.append(key, files[key]);
    }
    
    const response = await fetch(`${window.location.origin}${url}`, {
        credentials: 'include',
        headers: {
            // "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        method: 'POST',
        body: formData,
    });

    return await response.json();
};