// Initializes the `judet` service on path `/judet`
const createService = require('feathers-sequelize');
const createModel = require('../../models/searchquery');
const hooks = require('./query-report.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'searchquery',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/query-report', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('query-report');

  service.hooks(hooks);
};
