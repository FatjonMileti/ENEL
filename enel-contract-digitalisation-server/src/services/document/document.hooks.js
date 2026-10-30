const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');
const { sameUser, populateSession, notClosed, populateUser,
  requireType } = require('../../hooks/session.js');

module.exports = {
  before: {
    all: [],
    find: [hooks.disallow('external')],
    get: [authenticate('jwt'), populateUser, populateSession, sameUser,
      // in24HourTimeFrame,
      // notClosed,
      requireType],
    create: [authenticate('jwt'), populateUser, populateSession, sameUser,
      // in24HourTimeFrame, 
      notClosed, requireType],
    update: [hooks.disallow('external')],
    patch: [authenticate('jwt'), populateSession],
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
