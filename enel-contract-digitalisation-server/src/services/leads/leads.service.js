// Initializes the `leads` service on path `/leads`
const createService = require('feathers-sequelize');
const createModel = require('../../models/lead.model');
const hooks = require('./leads.hooks');

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'leads',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/leads', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('leads');

  service.hooks(hooks);
};
