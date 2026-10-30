// Initializes the `api` service on path `/api`
const { Api } = require('./api.class');
const hooks = require('./api.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/api', new Api(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('api');

  service.hooks(hooks);
};
