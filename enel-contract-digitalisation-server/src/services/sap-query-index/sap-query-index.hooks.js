const {authenticate} = require('@feathersjs/authentication').hooks;
const {BadRequest} = require('@feathersjs/errors');
const hooks = require('feathers-hooks-common');

const fields = ["ENELID"];

const validateIndexData = async context => {
    Object.keys(context.params.query).forEach(field => {
        if (!fields.includes(field)) {
            throw new BadRequest(`${field} is not a valid field`);
        }
    });
    //we check that all the fields are part of the request since they are all required
    fields.forEach(field => {
        if (!Object.keys(context.params.query).includes(field)) {
            throw new BadRequest(`'${field}' is required`);
        }
    });
};

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [validateIndexData],
        get: [hooks.disallow('external')],
        create: [hooks.disallow('external')],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [hooks.disallow('external')]
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
