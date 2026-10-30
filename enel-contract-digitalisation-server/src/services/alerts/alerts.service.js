// Initializes the `alerts` service on path `/alerts`
const createService = require('feathers-sequelize');
const createModel = require('../../models/alerts.model');
const hooks = require('./alerts.hooks');

module.exports = function (app) {
    const Model = createModel(app);
    const paginate = app.get('paginate');

    const options = {
        name: 'alerts',
        Model,
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/alerts', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('alerts');

    service.hooks(hooks);
};