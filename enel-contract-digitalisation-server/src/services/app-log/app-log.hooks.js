const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [
            context => {
                const sequelize = context.app.get('sequelizeClient');
                const SessionModel = sequelize.model('session');
                const UserModel = sequelize.model('users');

                let query = {
                    include: [{
                        model: SessionModel,
                        attributes: [],
                        as: 'session',
                        include: [{
                            model: UserModel,
                            attributes: [],
                            as: 'agent',
                        }]
                    }]
                };

                context.params.sequelize = query;

                delete context.params.query.include;
                delete context.params.query.$group;
                return context;
            }
        ],
        get: [],
        create: [],
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