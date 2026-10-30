'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addIndex({
            schema: process.env.PG_SCHEMA,
            tableName: 'lead-logs',
        }, ['agent_id']);
    },
    down: (queryInterface, Sequelize) => {}
};
