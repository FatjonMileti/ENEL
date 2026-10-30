import 'whatwg-fetch';
import _ from 'lodash';

const request = async (url, options, headers) => {
    options.headers = _.assign(options.headers, headers, {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
    });

    const response = await fetch(url, options);
    let data = {};

    try {
        data = await response.json();
    } catch (e) {
        // nothing to do here
    }

    return [response, data];
};

const requestFile = async (url, options, headers) => {
    options.headers = _.assign(options.headers, headers);

    const response = await fetch(url, options);
    let data = {};

    try {
        data = await response.blob();
    } catch (e) {
        // nothing to do here
    }

    return [response, data];
};

const serializeParams = params => {
    if (params instanceof Object) {
        const serialized = [];

        _.each(params, (param, key) => {
            serialized.push(`${key}=${encodeURIComponent(params[key])}`);
        });

        return {
            body: serialized.join('&'),
            contentType: 'application/x-www-form-urlencoded',
        };
    }

    return {
        body: JSON.stringify(params),
        contentType: 'application/json',
    };
};

const HttpService = {};

HttpService.get = async (url, params = {}, headers = {}) => {
    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const { body: query } = serializeParams(params);
    const reqUrl = query !== '' ? `${url}?${query}` : url;

    return request(reqUrl, options, headers);
};

HttpService.getFile = async (url, params = {}, headers = {}) => {
    const options = {
        method: 'GET',
    };

    const { body: query } = serializeParams(params);
    const reqUrl = query !== '' ? `${url}?${query}` : url;

    return requestFile(reqUrl, options, headers);
};

HttpService.post = async (url, params = {}, headers = {}) => {
    const { body, contentType } = serializeParams(params);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': contentType,
        },
        body,
    };

    return request(url, options, headers);
};

HttpService.postFiles = async (url, params = {}, headers = {}) => {
    const formData = new FormData();

    _.each(params, (value, key) => {
        if (_.isArray(value)) {
            value.forEach(v => {
                formData.append(key, v);
            });
        } else {
            formData.append(key, value);
        }
    });

    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
        body: formData,
    };

    return request(url, options, headers);
};

HttpService.postJSON = async (url, params = {}, headers = {}) => {
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    };

    return request(url, options, headers);
};

HttpService.put = async (url, params = {}, headers = {}) => {
    const { body, contentType } = serializeParams(params);
    const options = {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': contentType,
        },
        body,
    };

    return request(url, options, headers);
};

HttpService.patch = async (url, params = {}, headers = {}) => {
    const { body, contentType } = serializeParams(params);
    const options = {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            'Content-Type': contentType,
        },
        body,
    };

    return request(url, options, headers);
};

HttpService.patchJSON = async (url, params = {}, headers = {}) => {
    const options = {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    };

    return request(url, options, headers);
};

HttpService.delete = async (url, params = {}, headers = {}) => {
    const { body, contentType } = serializeParams(params);
    const options = {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'Content-Type': contentType,
        },
        body,
    };
    return request(url, options, headers);
};

export default HttpService;
