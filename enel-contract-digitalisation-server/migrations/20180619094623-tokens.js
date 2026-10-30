'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable(
            'tokens', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                token: {
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
        ).then(() =>
            queryInterface.addIndex(`${process.env.PG_SCHEMA}.tokens`, ['token', 'createdAt'], { indexName: 'tokens_by_create_date' })
        ),
    down: (queryInterface, Sequelize) => 
        queryInterface
            .removeIndex(`${process.env.PG_SCHEMA}.tokens`, { indexName: 'tokens_by_create_date' })
            .then(() => queryInterface.dropTable('tokens', { schema: process.env.PG_SCHEMA }))
};