const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { hashToken } = require('../../utils/commonAuthentication');


module.exports = {
    before: {
        all: [async ctx => {
            ctx.params.headers.path = await hashToken(ctx.path);
            return ctx;
        },
        authenticate('jwt')
        ],
        find: [hooks.disallow()],
        get: [hooks.disallow()],
        create: [hooks.disallow()],
        update: [hooks.disallow()],
        patch: [],
        remove: [hooks.disallow()]
    },

    after: {
        all: [],
        find: [hooks.disallow()],
        get: [hooks.disallow()],
        create: [hooks.disallow()],
        update: [hooks.disallow()],
        patch: [],
        remove: [hooks.disallow()]
    },

    error: {
        all: [],
        find: [hooks.disallow()],
        get: [hooks.disallow()],
        create: [hooks.disallow()],
        update: [hooks.disallow()],
        patch: [],
        remove: [hooks.disallow()]
    }
};