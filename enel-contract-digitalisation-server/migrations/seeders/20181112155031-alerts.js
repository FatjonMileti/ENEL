'use strict';
require('dotenv').config();

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const schema = process.env.PG_SCHEMA;
        const promises = [];

        const alerts = [{
            id: 1,
            name: 'Approved for activation',
            description: '',
            emails: [],
            isActive: true,
            type: 'activated',
            createdAt: new Date().toUTCString(),
            updatedAt: new Date().toUTCString(),
        }, {
            id: 2,
            name: 'Pending approval',
            description: '',
            emails: [],
            isActive: true,
            type: 'pending',
            createdAt: new Date().toUTCString(),
            updatedAt: new Date().toUTCString(),
        }, {
            id: 3,
            name: 'Rejected by client',
            description: '',
            emails: [],
            isActive: true,
            type: 'rejected',
            createdAt: new Date().toUTCString(),
            updatedAt: new Date().toUTCString(),
        }, {
            id: 4,
            name: 'Unfinished',
            description: '',
            emails: [],
            isActive: true,
            type: 'unfinished',
            createdAt: new Date().toUTCString(),
            updatedAt: new Date().toUTCString(),
        }, {
            id: 5,
            name: 'Cancelled or with error',
            description: '',
            emails: [],
            isActive: true,
            type: 'errored',
            createdAt: new Date().toUTCString(),
            updatedAt: new Date().toUTCString(),
        }];

        alerts.forEach((alert) => {
            const columns = `"id", "name", "description", "emails", "isActive", "type", "createdAt", "updatedAt"`;
            const values = `'${alert.id}', '${alert.name}', '${alert.description}', '[]', '${alert.isActive}', '${alert.type}', '${alert.createdAt}', '${alert.updatedAt}'`;
            console.log(`INSERT INTO "${schema}".alerts (${columns}) VALUES (${values})`);
            promises.push(
                queryInterface.sequelize.query(`INSERT INTO "${schema}".alerts (${columns}) VALUES (${values})`)
            );
        });

        await Promise.all(promises);
    },

    down: (queryInterface, Sequelize) => {

    }
};
