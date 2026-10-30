const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { populateUser, checkPermission } = require('../../hooks/session.js');
const { USER_ROLE } = require('../../utils/enums.js');


module.exports = {
    before: {
        all: [],
        find: [],
        get: [
            async ctx => {
                let hook = await authenticate('jwt')(ctx);
                if (hook.params.payload) {
                    ctx = await populateUser(ctx);
                    ctx = checkPermission('resetPassword.all')(ctx);
                } else {
                    return hooks.disallow('external')(ctx);
                }
                return ctx;
            }
        ],
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
