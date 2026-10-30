'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        const promisesAdd = [
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'abandon_type', {
                type: Sequelize.STRING,
                allowNull: true,
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'abandon_details', {
                type: Sequelize.TEXT,
                allowNull: true,
            })
        ];

        return Promise.all(promisesAdd);
    },

    down: (queryInterface, Sequelize) => {
        const promisesRemove = [
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'abandon_type'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'abandon_details')
        ];
        return Promise.all(promisesRemove);
    }
};

