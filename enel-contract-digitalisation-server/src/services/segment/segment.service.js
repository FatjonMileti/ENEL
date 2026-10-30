// Initializes the `segment` service on path `/segment`
const createService = require('feathers-sequelize');
const createModel = require('../../models/segment.model');
const hooks = require('./segment.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'segment',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/segment', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('segment');

  service.hooks(hooks);
};
