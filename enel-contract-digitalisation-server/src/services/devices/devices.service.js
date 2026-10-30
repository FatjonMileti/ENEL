const createService = require('feathers-memory');
const hooks = require('./devices.hooks');
const { getPermissionRoles } = require('../../utils/permissions.js');
const { USER_ROLE } = require('../../utils/enums.js');

module.exports = function (app) {

    const paginate = app.get('paginate');

    const options = {
        paginate
    };

    app.use('/devices', createService(options));

    const service = app.service('devices');
    service.create([{
        id: 1,
        clientid: 'fsd-android-app1',
        clientsecret: '$2a$12$bjClVvnN63ucu4GqIwhides1u.KvPoWAsneq2JhpeHTOzNLzsWFc.',
        userroles:  getPermissionRoles('app.androidApp1')
    },
    {
        id: 2,
        clientid: 'fsd-cms',
        clientsecret: '$2a$12$bjClVvnN63ucu4GqIwhides1u.KvPoWAsneq2JhpeHTOzNLzsWFc.',
        userroles: getPermissionRoles('app.cms')
    },
    {
        id: 3,
        clientid: 'fsd-web-app',
        clientsecret: '$2a$12$bjClVvnN63ucu4GqIwhides1u.KvPoWAsneq2JhpeHTOzNLzsWFc.'
    },
    {
        id: 4,
        clientid: 'fsd-telesales-agent',
        clientsecret: '$2a$12$bjClVvnN63ucu4GqIwhides1u.KvPoWAsneq2JhpeHTOzNLzsWFc.',
        userroles: getPermissionRoles('app.telesalesAgent')
    },
    {
        id: 5,
        clientid: 'fsd-backoffice-form',
        clientsecret: '$2a$12$bjClVvnN63ucu4GqIwhides1u.KvPoWAsneq2JhpeHTOzNLzsWFc.',
        userroles: getPermissionRoles('app.backofficeForm')
    }],
);

    service.hooks(hooks);
};