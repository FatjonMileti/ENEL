'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'blacklist',
    }, 'fieldType', {
      type: Sequelize.STRING,
      allowNull: false
    })
  },

  down: (queryInterface, Sequelize) => {
  }
};
