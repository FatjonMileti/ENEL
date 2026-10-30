'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable(
            'invoice_examples', {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                type: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                furnizor_id: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                county: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                market: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                image: {
                    type: Sequelize.STRING,
                    allowNull: true
                },
                code_type: {
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
        queryInterface.dropTable('invoice_examples', { schema: process.env.PG_SCHEMA })
};