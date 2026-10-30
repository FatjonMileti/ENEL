const createService = require('./sap-check-index.class.js');
const hooks = require('./sap-check-index.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'sap-check-index',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/sap-check-index', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('sap-check-index');

  service.hooks(hooks);
};
