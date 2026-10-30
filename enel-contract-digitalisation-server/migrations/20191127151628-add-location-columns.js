'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'session',
                }, 'location_lat', {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'session',
                }, 'location_long', {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                })
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'session',
                }, 'location_lat'),
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'session',
                }, 'location_long')
        ]);
    }
};
