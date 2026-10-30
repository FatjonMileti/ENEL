const { authenticate } = require('@feathersjs/authentication').hooks;
const { sameUser, populateSession, notClosed, populateUser, requireType, checkPermission } = require('../../hooks/session.js');
const { USER_ROLE } = require('../../utils/enums.js');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ 
      populateUser, 
      checkPermission('logs.find'),
    ],
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
