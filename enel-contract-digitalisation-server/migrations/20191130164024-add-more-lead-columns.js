'use strict';
require('dotenv').config();

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'fullName', {
                    type: Sequelize.STRING,
                    allowNull: true
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'mobile', {
                    type: Sequelize.STRING,
                    allowNull: true
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'pod', {
                    type: Sequelize.STRING,
                    allowNull: true,
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'consumption', {
                    type: Sequelize.STRING,
                    allowNull: true,
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'energyType', {
                    type: Sequelize.STRING,
                    allowNull: true,
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'market', {
                    type: Sequelize.STRING,
                    allowNull: true,
                }),
            queryInterface
                .addColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'originalData', {
                    type: Sequelize.JSONB,
                    allowNull: true,
                }),
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'mobile'),
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'pod'),
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'consumption'),
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'energyType'),
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'market'),
            queryInterface
                .removeColumn({
                    schema: process.env.PG_SCHEMA,
                    tableName: 'leads',
                }, 'originalData')
        ]);
    }
};
