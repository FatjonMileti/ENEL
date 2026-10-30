'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'callback_date', {
                    type: Sequelize.DATE,
                    allowNull: true
                }),
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'callback_date'),
        ]);
    }
};
