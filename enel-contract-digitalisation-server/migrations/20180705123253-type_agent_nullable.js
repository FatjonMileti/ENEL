'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface
            .addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'client_app', { type: Sequelize.STRING, allowNull: true })
            .then(() => queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'company_id', { type: Sequelize.INTEGER, allowNull: true }))
            .then(() => queryInterface.changeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session'
            }, 'agent_id', { type: Sequelize.INTEGER, allowNull: true }))
            .then(() => queryInterface.changeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session'
            }, 'type', { type: Sequelize.STRING(5), allowNull: true }));
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface
            .removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'client_app')
            .then(() => queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session',
            }, 'company_id'))
            .then(() => queryInterface.changeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session'
            }, 'agent_id', { type: Sequelize.INTEGER, allowNull: false }))
            .then(() => queryInterface.changeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'session'
            }, 'type', { type: Sequelize.STRING(5), allowNull: false }));
    }
};