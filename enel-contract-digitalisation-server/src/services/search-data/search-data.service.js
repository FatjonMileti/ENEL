// Initializes the `sign` service on path `/sign`
const createService = require('./search-data.class.js');
const hooks = require('./search-data.hooks');
module.exports = function (app) {
  
  const options = {
    name: 'search-data',
  };

  // Initialize our service with any options it requires
  app.use('/search-data', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('search-data');

  service.hooks(hooks);
};
