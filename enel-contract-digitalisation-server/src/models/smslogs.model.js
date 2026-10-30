// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
    const sequelizeClient = app.get instanceof Function ? app.get('sequelizeClient') : app;
    const SMSLogs = sequelizeClient.define('smslogs', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        smslogid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: false
        },
        flow: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
        createdat: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        },
        timestamps: false
    });



    return SMSLogs;
};