// Initializes the `service-offers` service on path `/service-offers`
const createService = require('feathers-sequelize');
const createModel = require('../../models/service-offers.model');
const hooks = require('./service-offers.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'service-offers',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/service-offers', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('service-offers');

  service.hooks(hooks);
};
