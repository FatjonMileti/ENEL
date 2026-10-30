// Initializes the `importData` service on path `/import-data`
const createService = require('./import-data.class.js');
const hooks = require('./import-data.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'import-data',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/import-data', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('import-data');

  service.hooks(hooks);
};
