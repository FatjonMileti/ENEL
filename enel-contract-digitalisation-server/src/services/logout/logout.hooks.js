const { authenticate } = require('@feathersjs/authentication').hooks;
const Errors = require('@feathersjs/errors');
const { populateUser } = require('../../hooks/session.js');


module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [populateUser],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [async ctx => {

           const token = await ctx.params.headers.authorization.split(" ")[1];

           await ctx.app.service('token-blacklist').create({
            token,
            userId: ctx.params.user_id,
            expiredAt: new Date()
           })

           return ctx

        }],
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