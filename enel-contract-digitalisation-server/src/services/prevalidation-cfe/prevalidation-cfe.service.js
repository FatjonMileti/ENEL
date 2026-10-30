// Initializes the `activate` service on path `/activate`
const createService = require('./prevalidation-cfe.class.js');
const hooks = require('./prevalidation-cfe.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'prevalidation-cfe',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/prevalidation-cfe', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('prevalidation-cfe');

  service.hooks(hooks);
};
