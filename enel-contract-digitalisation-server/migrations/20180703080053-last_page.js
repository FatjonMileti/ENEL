'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'ee_last_page', { type: Sequelize.STRING(100), allowNull: true })
            .then(() => queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'gaz_last_page', { type: Sequelize.STRING(100), allowNull: true }));
    },
    down: (queryInterface) => {
        return queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'ee_last_page')
            .then(() => queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'gaz_last_page'));
    }
};