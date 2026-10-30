'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'is_link_sent', {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'is_link_sent');
    }
};
