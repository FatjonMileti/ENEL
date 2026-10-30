'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'ee_serviciu_pana_la', {
                type: Sequelize.DATE,
                allowNull: true,
            }),
            queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'gaz_serviciu_pana_la', {
                type: Sequelize.DATE,
                allowNull: true,
            }),
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'ee_serviciu_pana_la'),
            queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'gaz_serviciu_pana_la'),
        ]);
    }
};
