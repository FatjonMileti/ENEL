'use strict';
require('dotenv').config();
module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.addColumn({
            schema: process.env.PG_SCHEMA,
            tableName: 'users',
        }, 'furnizor', { type: Sequelize.STRING(5), allowNull: true, defaultValue: null })
            .then(() => queryInterface.sequelize.query(`
            UPDATE ${process.env.PG_SCHEMA}.users SET furnizor = 'EE';`
            )),
    down: (queryInterface, Sequelize) => 
        queryInterface.removeColumn({
            schema: process.env.PG_SCHEMA,
            tableName: 'users',
        }, 'furnizor')
};
