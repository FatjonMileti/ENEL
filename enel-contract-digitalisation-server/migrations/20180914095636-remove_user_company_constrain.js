'use strict';
require('dotenv').config();

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint(`${process.env.PG_SCHEMA}.users`, 'users_companyId_fkey')
  },

  down: (queryInterface, Sequelize) => {
  }
};
