'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) => 
        queryInterface.createTable(
            'users', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                marca: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    // unique: true
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    unique: false
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                firstName: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    unique: false
                },
                lastName: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    unique: false
                },
                createdAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                companyId: Sequelize.INTEGER,
                type: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                role: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                isActive: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                lastLogin: Sequelize.DATE,
                failedLogins: Sequelize.INTEGER,
                maxPassReachDate: Sequelize.DATE
            }, {
                schema: process.env.PG_SCHEMA
            }
        ).then(() =>
            queryInterface.addIndex(`${process.env.PG_SCHEMA}.users`, ['marca'], { indexName: 'users_by_marca' })
        ),
    down: (queryInterface, Sequelize) => 
        queryInterface.removeIndex(`${process.env.PG_SCHEMA}.users`, { indexName: 'users_by_marca' })
            .then(() => queryInterface.dropTable('users', { schema: process.env.PG_SCHEMA }))
};