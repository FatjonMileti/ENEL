const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { omit } = require('lodash');

module.exports = {
  before: {
    all: [  ],
    // all: [ authenticate('jwt') ],
    find: [
      async context => {
        if(context.params.query.withLocationId){
        context.params['withLocationId'] = context.params.query.withLocationId;

        context.params.query = omit(context.params.query, 'withLocationId');
      }

        const sequelize = context.app.get('sequelizeClient');
        const LocalitateModel = sequelize.model('localitate');
        context.params.sequelize = {
          include: [{
            model: LocalitateModel,
            as: 'localitate'
          }]
        };
      }
    ],
    get: [],
    create: [hooks.disallow('external')],
    update: [hooks.disallow('external')],
    patch: [hooks.disallow('external')],
    remove: [hooks.disallow('external')]
  },

  after: {
    all: [],
    find: [
      async context => {
        // Ommit not needed fields
        if(context.params['withLocationId'] === 'true') {
          const transformedResults = context.result.data.map( it => {
            return {denumire: it.denumire, tip_artera: it.tip_artera, internal_id: it.internal_id,
              localitate_id: it['localitate.internal_id'],
              localitate: it['localitate.denumire'], judet: it['localitate.judet']};
          });
          context.result = transformedResults;
        } else {
          const transformedResults = context.result.data.map( it => {
            return {denumire: it.denumire, tip_artera: it.tip_artera, internal_id: it.internal_id,
              localitate: it['localitate.denumire'], judet: it['localitate.judet']};
          });
          context.result = transformedResults;
        }
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
