"use strict";
require("dotenv").config();

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      "lead-logs",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        leadId: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        sessionId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        agent_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        log: {
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
      },
      {
        schema: process.env.PG_SCHEMA
      }
    ),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable("lead-logs", {
      schema: process.env.PG_SCHEMA
    })
};