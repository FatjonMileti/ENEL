// Initializes the `sign` service on path `/sign`
const createService = require('./sign.class.js');
const hooks = require('./sign.hooks');

module.exports = function (app) {
  const paginate = app.get('paginate');

  const options = {
    name: 'sign',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/sign', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('sign');

  service.hooks(hooks);
};
