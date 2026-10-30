// Initializes the `activate` service on path `/activate`
const createService = require('./activate.class.js');
const hooks = require('./activate.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'activate',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/activate', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('activate');

  service.hooks(hooks);
};
