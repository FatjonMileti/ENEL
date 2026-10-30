// Initializes the `campaign` service on path `/campaign`
const createService = require('./campaign.class.js');
const hooks = require('./campaign.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'campaign',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/campaign', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('campaign');

  service.hooks(hooks);
};
