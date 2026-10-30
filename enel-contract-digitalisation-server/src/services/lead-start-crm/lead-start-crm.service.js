const createService = require('./lead-start-crm.class.js');
const hooks = require('./lead-start-crm.hooks.js');
const createBlackListModel = require('../../models/blacklist.model');

module.exports = function (app) {
  const BlackListModel = createBlackListModel(app);
  
  const paginate = app.get('paginate');

  const options = {
    name: 'lead-start-crm',
    BlackListModel,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/lead-start-crm', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('lead-start-crm');

  service.hooks(hooks);
};
