import app_log from './app-log.js';
import blacklist from './blacklist.js';
import whitelist from './whitelist.js';
import queryReporter from './query-report.js';
import user from './user.js';
import session from './session.js';
import sessionHistory from './session-history.js';
import common from './common.js';
import tipcanal from './tip-canal.js';
import distribuitor from './distribuitor.js';
import canal from './canal.js';
import company from './company.js';
import alerts from './alerts.js';
import location from './location.js';
import ping from './ping.js';
import versions from './versions.js';
import variantePret from './variante-pret-cache.js';


export default {
    app_log,
    blacklist,
    whitelist,
    alerts,
    variantePret,
    common,
    location,
    ping,
    user,
    queryReporter,
    session,
    sessionHistory,
    tipcanal,
    distribuitor,
    canal,
    company,
    versions,
};

export const logout = () => {
    window.location.href = `${window.location.origin}/cms-v2/login`;
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

            if (response.url == `${window.location.origin}/users`) {
                return {"success":false};
            }

            console.error('unexpected response from server', response.status);
            return null;
        }
    }

    return await response.json();
};

export const requestDoc = async (verb = 'GET', url, body = undefined, withResp = false) => {
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
            "Content-Type": "application/form-data;",
            'Authorization': `Bearer ${token}`
        },
        method: verb,
        body: body
    });

    if (!withResp) {
        if (!response.ok && response.url !== `${window.location.origin}/change-password`) {
            if ([401, 403, 405].indexOf(response.status) !== -1) {
                console.error('401 response from server. logging out...');
                return logout();
            }

            if (response.url == `${window.location.origin}/users`) {
                return {"success":false};
            }

            console.error('unexpected response from server', response.status);
            return null;
        }
    }

    return await response.json();
};
