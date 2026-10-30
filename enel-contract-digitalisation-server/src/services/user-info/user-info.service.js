const createService = require('feathers-memory');
const hooks = require('./user-info.hooks');

module.exports = function(app) {
    const paginate = app.get('paginate');
    const options = {
        paginate
    };
    app.use('/user-info', createService(options));
    const service = app.service('user-info');
    service.hooks(hooks);
};