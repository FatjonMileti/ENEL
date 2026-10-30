'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable(
            'passwords', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                createdAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                }
            }, {
                schema: process.env.PG_SCHEMA
            }
        ).then(() => queryInterface
            .addIndex(`${process.env.PG_SCHEMA}.passwords`, ['userId', 'createdAt'], { indexName: 'passwords_composite' })
        ),
    down: (queryInterface, Sequelize) => 
        queryInterface.removeIndex(`${process.env.PG_SCHEMA}.passwords`, { indexName: 'passwords_composite' })
            .then(() => queryInterface.dropTable('passwords', { schema: process.env.PG_SCHEMA }))
};