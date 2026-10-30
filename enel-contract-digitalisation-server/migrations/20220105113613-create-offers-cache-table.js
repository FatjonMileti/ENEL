"use strict";
require("dotenv").config();

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(
            "offer-cache",
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                canal: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                segment: {
                    type: Sequelize.STRING,
                    allowNull: true
                },
                serviciu: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                judet: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                furn24: {
                    type: Sequelize.STRING,
                    allowNull: false
                },
                scadenta: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                createdAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW,
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                products: {
                    type: Sequelize.JSON,
                    allowNull: true
                },
            },
            {
                schema: process.env.PG_SCHEMA
            }
        )
        return queryInterface.addIndex(
            `${process.env.PG_SCHEMA}.offer-cache`,
            ['canal', 'segment', 'serviciu', 'judet', 'furn24', 'scadenta'],
            { indexName: 'all_columns_index' });
    },
    down: (queryInterface, Sequelize) =>
        queryInterface.dropTable("offer-cache", {
            schema: process.env.PG_SCHEMA
        })
};
