import * as getVariantePretEE from './get-variante-pret-ee.json';
import * as getVariantePretGAZ from './get-variante-pret-gaz.json';
import * as getVariantePretCOMBO from './get-variante-pret-combo.json';
import * as getDocuments from './get-documents.json';
import * as postOffer from './post-offer.json';
import * as postSign from './post-sign.json';

import _ from 'lodash';

const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const PATCH = 'PATCH';
const DELETE = 'DELETE';

const requests = [{
    method: GET,
    resource: '/variante-pret',
    params: {
        serviciu: 'EE',
    },
    response: getVariantePretEE,
}, {
    method: GET,
    resource: '/variante-pret',
    params: {
        serviciu: 'GAZ',
    },
    response: getVariantePretGAZ,
}, {
    method: GET,
    resource: '/variante-pret',
    params: {
        serviciu: 'COMBO',
    },
    response: getVariantePretCOMBO,
}, {
    method: GET,
    resource: '/document',
    response: getDocuments,
}, {
    method: POST,
    resource: '/offer',
    response: postOffer,
}, {
    method: POST,
    resource: '/sign',
    response: postSign,
}];

const request = (method, resource, params) => {
    [resource] = resource.split('?');
    const result = _.find(requests, request => (
        method == request.method &&
        resource == request.resource &&
        (!request.params || _.isMatch(params, request.params))
    ));

    return result ? result.response : null;
};

export default {
    get: (resource, params) => request(GET, resource, params),
    post: (resource, params) => request(POST, resource, params),
    put: (resource, params) => request(PUT, resource, params),
    patch: (resource, params) => request(PATCH, resource, params),
    delete: (resource, params) => request(DELETE, resource, params),
};
