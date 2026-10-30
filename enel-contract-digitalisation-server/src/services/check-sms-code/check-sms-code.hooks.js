const { authenticate } = require('@feathersjs/authentication').hooks;
// const commonHooks = require('feathers-hooks-common');

/*
const authenticate = () =>
  commonHooks.iff(
    // if and only if the request is external
    commonHooks.every(commonHooks.isProvider('external')),
    commonHooks.combine(auth.hooks.authenticate(['jwt', 'totp']), auth.hooks.authenticate('totp'))
  );
*/


module.exports = {
  before: {
    all: [
      authenticate('totp')
    ],
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
