const { authenticate } = require('@feathersjs/authentication').hooks;
const _ = require('lodash');

module.exports = {
    before: {
        all: [ authenticate('jwt') ],
        find: [
            context => {
                const sequelize = context.app.get('sequelizeClient');
                const UserModel = sequelize.model('users');

                const query = {
                    include: [{
                        model: UserModel,
                        attributes: ['type', 'employed'],
                        as: 'agent',
                    }]
                };

                context.params.sequelize = query;
                return context;
            }
        ],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [],
        find: [
            context => {
                context.result.data = _.uniqBy(context.result.data, 'internal_id');
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
