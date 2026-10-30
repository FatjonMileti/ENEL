const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { hashToken, throwNotAuth } = require('../../utils/commonAuthentication');
const moment = require('moment');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [hooks.disallow('external')],
        get: [hooks.disallow('external')],
        create: [hooks.disallow('external'), async ctx => {
            try {
                const token = ctx.data.token;
                const tokenExists = await ctx.service.find({
                    query: {
                        token,
                        createdAt: {
                            $gt: moment().subtract(2, 'days')
                        },
                        $limit: 1
                    }
                });
                if (tokenExists.total > 0) {
                    throw '#Invalid token!';
                }
                return ctx;
            } catch (err) {
                throwNotAuth(err);
            }
        }],
        update: [hooks.disallow()],
        patch: [hooks.disallow()],
        remove: [async ctx => {
            ctx.service.create({
                token: await hashToken(ctx.params.payload.jti)
            });
            throwNotAuth('#Invalid token!');
        }]
    },

    after: {
        all: [],
        find: [hooks.disallow('external')],
        get: [hooks.disallow()],
        create: [hooks.disallow('external')],
        update: [hooks.disallow()],
        patch: [hooks.disallow()],
        remove: []
    },

    error: {
        all: [],
        find: [hooks.disallow('external')],
        get: [hooks.disallow()],
        create: [hooks.disallow('external')],
        update: [hooks.disallow()],
        patch: [hooks.disallow()],
        remove: []
    }
};