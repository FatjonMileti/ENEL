"use strict";
require("dotenv").config();

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      "versions",
      {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        client_app: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        version: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        url : {
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
      },
      {
        schema: process.env.PG_SCHEMA
      }
    ),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable("versions", {
      schema: process.env.PG_SCHEMA
    })
};