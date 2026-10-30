const hooks = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { populateUser } = require('../../hooks/session.js');


module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [ 
      async context => {
        await populateUser(context);
        const sequelize = context.app.get('sequelizeClient');
        const UserModel = sequelize.model('leads');

        const query = {
          include: [{
              model: UserModel,
              attributes: ['fullName', 'phone', 'firstName', 'lastName'],
              as: 'lead',
          }]
        };

        if (context.params.user) {
          context.params.query = {
            ...context.params.query,
            agent_id: context.params.user.id,
            active: true,
          }
        }

        context.params.sequelize = query;
        return context;
      }
    ],
    get: [],
    create: [
      async context => {
        await populateUser(context);
        context.data = {
          ...context.data,
          agent_id: context.params.user.id,
          active: true,
          action: 'CALL',
        }
      }
    ],
    update: [],
    patch: [],
    remove: [],
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
