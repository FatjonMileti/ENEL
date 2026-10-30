const hooks = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;

module.exports = {
  before: {
    all: [],
    find: [context => {
      return authenticate('jwt')(context);
    }, 
      async context => {
      const sequelize = context.app.get('sequelizeClient');
      const UserModel = sequelize.model('users');

      const query = {
        include: [{
            model: UserModel,
            attributes: ['companyId', 'marca', 'role', 'firstName', 'lastName', 'email'],
            as: 'agent',
        }]
      };

      context.params.sequelize = query;
      return context;

    }],
    get: [hooks.disallow('external')],
    create: [hooks.disallow('external')],
    update: [hooks.disallow('external')],
    patch: [hooks.disallow('external')],
    remove: []
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
