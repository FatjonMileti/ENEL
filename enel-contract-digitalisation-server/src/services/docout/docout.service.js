// Initializes the `docout` service on path `/docout`
const createService = require('./docout.class.js');
const hooks = require('./docout.hooks');

module.exports = function (app) {
  const paginate = app.get('paginate');

  const options = {
    name: 'document',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/docout', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('docout');

  service.hooks(hooks);
};
