const { authenticate } = require('@feathersjs/authentication').hooks;
const { populateUser } = require('../../hooks/session');

module.exports = {
  before: {
    all: [ async context => {
      await authenticate('jwt')(context);
    }, async context => {
      await populateUser(context);
      return context;
    }],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
