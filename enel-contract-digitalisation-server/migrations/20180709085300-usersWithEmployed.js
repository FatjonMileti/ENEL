'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn({
            schema: process.env.PG_SCHEMA,
            tableName: 'users',
        }, 'employed', { type: Sequelize.BOOLEAN, defaultValue: false }),
    down: (queryInterface) => 
        queryInterface.removeColumn({
            schema: process.env.PG_SCHEMA,
            tableName: 'users',
        }, 'employed')
};
