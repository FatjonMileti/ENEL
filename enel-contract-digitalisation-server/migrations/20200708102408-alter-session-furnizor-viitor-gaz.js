'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn({
      schema: process.env.PG_SCHEMA,
      tableName: 'session',
    }, 'gaz_furnizor_viitor', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn({
      schema: process.env.PG_SCHEMA,
      tableName: 'session',
    }, 'gaz_furnizor_viitor', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
