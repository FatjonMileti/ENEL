'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.addColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'users',
    }, 'pin', {
        type: Sequelize.STRING(5),
        allowNull: true,
        defaultValue: null
    }),
    down: (queryInterface, Sequelize) => queryInterface.removeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'users',
    }, 'pin')
};