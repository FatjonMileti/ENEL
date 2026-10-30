'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable(
            'app_log', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                sessionId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                client: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                type: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                page: {
                    type: Sequelize.STRING,
                    allowNull: true
                },
                details: {
                    type: Sequelize.TEXT,
                    defaultValue: true
                },
                createdAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
            }, {
                schema: process.env.PG_SCHEMA
            }
        ),
    down: (queryInterface, Sequelize) =>
        queryInterface.dropTable('app_log', { schema: process.env.PG_SCHEMA })
};