// Initializes the `variante-pret` service on path `/variante-pret`
const createService = require('./variante-pret-loading.class.js');
const hooks = require('./variante-pret-loading.hooks.js');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'variante-pret',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/variante-pret-loading', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('variante-pret-loading');

  service.hooks(hooks);
};
