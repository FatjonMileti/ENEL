'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'localitate', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'tip_artera', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'strada', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'nr_strada', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'bloc', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'scara', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'etaj', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'apartament', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_serie', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_numar', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_emis_de', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_emis_la', {
                type: Sequelize.STRING,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'cros', {
                type: Sequelize.JSONB,
                allowNull: true
            }),
            queryInterface.addColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'place', {
                type: Sequelize.JSONB,
                allowNull: true
            }),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'localitate'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'tip_artera'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'strada'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'nr_strada'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'bloc'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'scara'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'etaj'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'apartament'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_serie'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_numar'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_emis_de'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'ci_emis_la'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'cros'),
            queryInterface.removeColumn({
                schema: process.env.PG_SCHEMA,
                tableName: 'leads',
            }, 'place'),
        ]);
    }
};
