'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'session',
                }, 'ee_sign_channel', {
                    type: Sequelize.STRING,
                    allowNull: true,
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'session',
                }, 'gaz_sign_channel', {
                    type: Sequelize.STRING,
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
                }, 'ee_sign_channel'),
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'session',
                }, 'gaz_sign_channel')
        ]);
    }
};
