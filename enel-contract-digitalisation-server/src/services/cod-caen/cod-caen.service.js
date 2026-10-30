// Initializes the `cod-caen` service on path `/cod-caen`
const createService = require('feathers-sequelize');
const createModel = require('../../models/cod-caen.model');
const hooks = require('./cod-caen.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'cod-caen',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/cod-caen', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('cod-caen');

  service.hooks(hooks);
};
