// Initializes the `session` service on path `/session`
const createService = require('feathers-sequelize');
const createModel = require('../../models/session-history.model');
const hooks = require('./session-history.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'session-history',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/session-history', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('session-history');

  service.hooks(hooks);
};
