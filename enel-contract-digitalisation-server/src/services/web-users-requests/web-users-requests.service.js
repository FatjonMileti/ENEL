// Initializes the `web-users-requests` service on path `/web-users-requests`
const createService = require('feathers-sequelize');
const createModel = require('../../models/web-users-requests.model');
const hooks = require('./web-users-requests.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/web-users-requests', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('web-users-requests');

  service.hooks(hooks);
};
