// Initializes the `localitate` service on path `/localitate`
const createService = require('feathers-sequelize');
const createModel = require('../../models/localitate.model');
const hooks = require('./localitate.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'localitate',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/localitate', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('localitate');

  service.hooks(hooks);
};
