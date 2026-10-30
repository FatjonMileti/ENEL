'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface
      .addColumn({
          schema: process.env.PG_SCHEMA,
          tableName: 'session',
      }, 'ee_putere_avizata', {
          type: Sequelize.INTEGER,
          allowNull: true,
      })
  ]);
  },

  async down (queryInterface, Sequelize) {
  }
};
