'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'expiry_date_extended', {
                type: Sequelize.BOOLEAN,
                allowNull: true
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'expiry_date_extended'),
        ]);
    }
};
