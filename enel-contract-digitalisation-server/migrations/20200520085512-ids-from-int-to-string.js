'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'furnizor'
      }, 'internal_id', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'distribuitor'
      }, 'internal_id', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'strada'
      }, 'internal_id', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'strada'
      }, 'localitate_id', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'localitate'
      }, 'internal_id', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'tip_canal'
      }, 'internal_id', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'canal'
      }, 'internal_id', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'users'
      }, 'companyId', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn({
        schema: process.env.PG_SCHEMA,
        tableName: 'cod_postal'
      }, 'strada_id', {
        type: Sequelize.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
