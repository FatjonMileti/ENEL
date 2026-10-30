const createService = require('feathers-sequelize');
const createModel = require('../../models/app-log.model');
const hooks = require('./app-log.hooks');

module.exports = function (app) {
    const Model = createModel(app);
    const paginate = app.get('paginate');

    const options = {
        name: 'app-log',
        Model,
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/app-log', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('app-log');

    service.hooks(hooks);
};


