"use strict";
require("dotenv").config();

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      "leads",
      {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        sessionId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        agent_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        internal_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: true
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        cnp: {
          type: Sequelize.STRING,
          allowNull: true
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false
        },
        source: {
          type: Sequelize.STRING,
          allowNull: true
        },
        channel: {
          type: Sequelize.STRING,
          allowNull: true
        },
        expiry_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        notes: {
          type: Sequelize.JSON,
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
      },
      {
        schema: process.env.PG_SCHEMA
      }
    ),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable("leads", {
      schema: process.env.PG_SCHEMA
    })
};