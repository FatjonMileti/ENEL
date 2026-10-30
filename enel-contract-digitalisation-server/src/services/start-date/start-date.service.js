// Initializes the `start-date` service on path `/start-date`
const createService = require('./start-date.class.js');
const hooks = require('./start-date.hooks');

module.exports = function (app) {
    const paginate = app.get('paginate');
    const options = {
        name: 'start-date',
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/start-date', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('start-date');
    service.hooks(hooks);
};
