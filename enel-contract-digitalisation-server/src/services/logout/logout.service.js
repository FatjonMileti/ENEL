// Initializes the `logout` service on path `/logout`
const createService = require('./logout.class.js');
const hooks = require('./logout.hooks');

module.exports = function(app) {

    const paginate = app.get('paginate');

    const options = {
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/logout', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service('logout');

    service.hooks(hooks);
};