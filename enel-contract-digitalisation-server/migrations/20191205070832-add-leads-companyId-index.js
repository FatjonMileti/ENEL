'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addIndex({
            schema: process.env.PG_SCHEMA,
            tableName: 'leads',
        }, ['companyId']);
    },
    down: (queryInterface, Sequelize) => {}
};
