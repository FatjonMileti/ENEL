// Initializes the `sign` service on path `/sign`
const createService = require('./place.class.js');
const hooks = require('./place.hooks');
module.exports = function (app) {
  
  const options = {
    name: 'place',
  };

  // Initialize our service with any options it requires
  app.use('/place', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('place');

  service.hooks(hooks);
};
