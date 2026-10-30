'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addIndex({
            schema: process.env.PG_SCHEMA,
            tableName: 'app_log',
        }, ['sessionId', 'createdAt']);
    },
    down: (queryInterface, Sequelize) => {}
};
