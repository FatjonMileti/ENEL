const db = require('./sequelize');

class DbUpdater {
    constructor(sequelize) {
        if (!sequelize) {
            this.sequelize = db.sequelize;
        } else {
            this.sequelize = sequelize;
        }
    }

    async transactionalRenewTableData(transaction, schema, tableName, data) {
        if (!transaction) {
            throw new Error('Method first argument should be a sequelize transaction');
        }

        const t = transaction;
        try {
            const deleteQueryResults = await this.sequelize.query(`DELETE FROM "${schema}".${tableName}`, { schema: schema, transaction: t });
            const bulkInsertResults = await this.sequelize.queryInterface.bulkInsert({ tableName: tableName, schema: schema }, data, { transaction: t, returning: true });
            //Commit if successful
            // await t.commit();
            return Promise.resolve({
                schema: schema,
                table: tableName,
                previousRowCount: deleteQueryResults[1].rowCount,
                currentRowCount: bulkInsertResults.length
            });
        } catch (err) {
            // await t.rollback();
            throw err;
        }
    }

    async renewTableData(schema, tableName, data) {
        const t = await this.sequelize.transaction({ autocommit: true });
        try {
            const deleteQueryResults = await
            this.sequelize.query(`DELETE FROM ${schema}.${tableName}`, { schema: schema, transaction: t });
            const bulkInsertResults = await
            this.sequelize.queryInterface.bulkInsert({ tableName: tableName, schema: schema },
                data, { transaction: t, returning: true });
            //Commit if successful
            await t.commit();
            return Promise.resolve({
                schema: schema,
                table: tableName,
                previousRowCount: deleteQueryResults[1].rowCount,
                currentRowCount: bulkInsertResults.length
            });
        } catch (err) {
            await t.rollback();
            throw err;

        } finally {
            // db.sequelize.close();
        }
    }

    async truncateTable(schema, tableName) {
        try {
            await
            this.sequelize.query(`TRUNCATE ${schema}.${tableName}`, { schema: schema });

        } catch (err) {
            throw err;
        }
    }

}

module.exports = function(options) {
    return new DbUpdater(options);
};

module.exports.DbUpdater = DbUpdater;
