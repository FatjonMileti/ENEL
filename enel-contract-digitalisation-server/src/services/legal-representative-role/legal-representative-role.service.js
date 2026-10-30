const createService = require('./legal-representative-role.class.js');
const hooks = require('./legal-representative-role.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'legal-representative-role',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/legal-representative-role', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('legal-representative-role');

  service.hooks(hooks);
};
