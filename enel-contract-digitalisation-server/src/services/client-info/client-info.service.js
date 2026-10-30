// Initializes the `clientInfo` service on path `/client-info`
const createService = require('./client-info.class.js');
const hooks = require('./client-info.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'client-info',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/client-info', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('client-info');

  service.hooks(hooks);
};
