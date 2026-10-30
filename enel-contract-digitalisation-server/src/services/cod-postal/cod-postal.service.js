// Initializes the `cod-postal` service on path `/cod-postal`
const createService = require('feathers-sequelize');
const createModel = require('../../models/cod-postal.model');
const hooks = require('./cod-postal.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'cod-postal',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cod-postal', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cod-postal');

  service.hooks(hooks);
};
