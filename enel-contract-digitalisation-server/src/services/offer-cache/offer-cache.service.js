// Initializes the `session` service on path `/session`
const createService = require('feathers-sequelize');
const createModel = require('../../models/offer-cache.model');
const hooks = require('./offer-cache.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'offer-cache',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/offer-cache', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('offer-cache');

  service.hooks(hooks);
};
