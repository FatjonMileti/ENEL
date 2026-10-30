const createService = require('./blacklist.class.js');
const createModel = require('../../models/blacklist.model');
const hooks = require('./blacklist.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'blacklist',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/blacklist', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('blacklist');

  service.hooks(hooks);
};
