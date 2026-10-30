'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'web_users_requests',
            }, 'marca', {
                    type: Sequelize.STRING,
                    allowNull: true,
                });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'web_users_requests',
            }, 'marca');
    }
};
