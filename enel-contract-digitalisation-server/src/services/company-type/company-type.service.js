const createService = require('./company-type.class.js');
const hooks = require('./company-type.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'company-type',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/company-type', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('company-type');

  service.hooks(hooks);
};
