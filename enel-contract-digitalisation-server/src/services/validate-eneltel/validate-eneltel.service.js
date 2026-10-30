// Initializes the `session` service on path `/session`
const createService = require('./validate-eneltel.class.js');
const hooks = require('./validate-eneltel.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'validate-eneltel',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/validate-eneltel', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('validate-eneltel');

  service.hooks(hooks);
};
