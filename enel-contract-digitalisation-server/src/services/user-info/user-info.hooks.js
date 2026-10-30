const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [],
        find: [
            async ctx => {
                const user = await ctx.app.service('/users').find({
                    query: {
                        id: ctx.params.payload.user.id,
                        $limit: 1
                    }
                });

                if (user.total > 0) {
                    delete user.data[0].password;
                    user.data[0].clientId = ctx.params.payload.user ? ctx.params.payload.user.cid : 'local';
                    ctx.result = user.data[0];
                } else {
                    ctx.result = {
                        id: 0,
                        role: ctx.params.payload.user.role
                    };
                }
                return ctx;
            }
        ],
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