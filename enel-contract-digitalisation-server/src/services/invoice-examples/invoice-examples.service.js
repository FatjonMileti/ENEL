// Initializes the `importData` service on path `/import-data`
const createService = require('feathers-sequelize');
const createModel = require('../../models/invoice-examples.model');
const hooks = require('./invoice-examples.hooks.js');

module.exports = function (app) {
    const Model = createModel(app);
    const paginate = app.get('paginate');

    const options = {
        name: 'invoice-examples',
        Model,
        paginate
    };

    // Initialize our service with any options it requires
    app.use('/invoice-examples', createService(options));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('invoice-examples');

    service.hooks(hooks);
};
