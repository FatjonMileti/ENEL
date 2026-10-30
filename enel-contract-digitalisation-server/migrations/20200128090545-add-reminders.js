"use strict";
require("dotenv").config();

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      "reminder",
      {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        agent_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        leadId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: true
        },
        action: {
          type: Sequelize.STRING,
          allowNull: true
        },
        actionDate: {
          type: Sequelize.DATE,
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
    queryInterface.dropTable("reminder", {
      schema: process.env.PG_SCHEMA
    })
};