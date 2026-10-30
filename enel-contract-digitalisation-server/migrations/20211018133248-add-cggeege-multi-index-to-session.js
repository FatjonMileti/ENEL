'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addIndex(
        `${process.env.PG_SCHEMA}.session`,
        ['createdAt', 'gaz_offer_success', 'gaz_sign_success', 'ee_activate_success', 'ee_sign_success', 'gaz_activate_success', 'ee_offer_success'],
        { indexName: 'cggeege_index' });
  },
  
  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeIndex(`${process.env.PG_SCHEMA}.session`, 'cggeege_index');
  }
};
