const createService = require('./sap-query-index.class.js');
const hooks = require('./sap-query-index.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'sap-query-index',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/sap-query-index', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('sap-query-index');

  service.hooks(hooks);
};
