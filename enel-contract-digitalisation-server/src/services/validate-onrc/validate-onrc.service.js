const createService = require('./validate-onrc.class.js');
const hooks = require('./validate-onrc.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'validate-onrc',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/validate-onrc', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('validate-onrc');

  service.hooks(hooks);
};
