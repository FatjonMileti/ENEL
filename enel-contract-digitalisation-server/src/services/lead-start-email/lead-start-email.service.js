// Initializes the `email` service on path `/email`
const createService = require('./lead-start-email.class.js');
const hooks = require('./lead-start-email.hooks.js');

module.exports = function (app) {

    const paginate = app.get('paginate');

    const options = {
        name: 'lead-start-email',
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/lead-start-email', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('lead-start-email');

    service.hooks(hooks);
};
