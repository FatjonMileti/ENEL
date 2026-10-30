'use strict';
require('dotenv').config();
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
    .changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'smslogs'
    }, 'createdat', { type: Sequelize.DATE, defaultValue:Sequelize.literal('CURRENT_TIMESTAMP') })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
    .changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'smslogs'
    }, 'createdat', { type: Sequelize.DATE, defaultValue: new Date() })
  }
};
