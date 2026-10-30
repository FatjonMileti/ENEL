'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn({
      schema: process.env.PG_SCHEMA,
      tableName: 'session',
    }, 'ee_furnizor_viitor', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn({
      schema: process.env.PG_SCHEMA,
      tableName: 'session',
    }, 'ee_furnizor_viitor', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
