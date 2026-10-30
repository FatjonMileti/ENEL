'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'app_log',
            }, 'payload', {
                type: Sequelize.JSONB,
                allowNull: true
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'app_log',
            }, 'payload'),
        ]);
    }
};
