// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
    const sequelizeClient = app.get('sequelizeClient');
    const appLog = sequelizeClient.define('app_log', {
        sessionId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        client: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        page: {
            type: DataTypes.STRING,
            allowNull: true
        },
        details: {
            type: DataTypes.TEXT,
        },
        payload: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });

    // eslint-disable-next-line no-unused-vars
    appLog.associate = function (models) {
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
        appLog.belongsTo(models.session, { foreignKey: 'sessionId', targetKey: 'id', constraints: false, as: 'session' });
    };

    return appLog;
};