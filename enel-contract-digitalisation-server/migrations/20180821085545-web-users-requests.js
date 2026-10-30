'use strict';
require('dotenv').config();

module.exports = {
    up: async (queryInterface, Sequelize) => {
        queryInterface.createTable(
            'web_users_requests', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                token_id: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                cnp: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                pin: {
                    type: Sequelize.STRING(5),
                    allowNull: true
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
            .addIndex(
                `${process.env.PG_SCHEMA}.web_users_requests`, ['token_id', 'cnp'], { indexName: 'web_users_requests_composite' }
            )
        );
    },

    down: async (queryInterface, Sequelize) => {
        queryInterface.removeIndex(
            `${process.env.PG_SCHEMA}.web_users_requests`, { indexName: 'web_users_requests_composite' }
        ).then(() => queryInterface.dropTable(
            'web_users_requests', { schema: process.env.PG_SCHEMA }
        ));
    }
};