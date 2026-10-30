'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'is_fast_flow', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'is_fast_flow');
    }
};
