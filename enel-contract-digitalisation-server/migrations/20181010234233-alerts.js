'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable(
            'alerts', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: true
                },
                description: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                emails: {
                    type: Sequelize.JSON, // string with encrypted JSON - how to declare it?
                    allowNull: true,
                    unique: false
                },
                isActive: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                type: {
                    type: Sequelize.STRING,
                    allowNull: false
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
        queryInterface.dropTable('alerts', { schema: process.env.PG_SCHEMA })
};