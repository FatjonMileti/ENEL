'use strict';
require('dotenv').config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.sequelize.query(`
            UPDATE ${process.env.PG_SCHEMA}.session SET client_app = '${process.env.ANDROID_APP1}' where client_app is NULL;`
    )
  },

  down: async (queryInterface, Sequelize) => {
  }
};
