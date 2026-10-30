// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
    const sequelizeClient = app.get('sequelizeClient');
    const offerCache = sequelizeClient.define('offer-cache', {
        canal: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        segment: {
            type: DataTypes.STRING,
            allowNull: true
        },
        serviciu: {
            type: DataTypes.STRING,
            allowNull: false
        },
        judet: {
            type: DataTypes.STRING,
            allowNull: false
        },
        furn24: {
            type: DataTypes.STRING,
            allowNull: false
        },
        scadenta: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        consum_anual_estimat: {
            type: DataTypes.STRING,
            allowNull: true
        },
        products: {
            type: DataTypes.JSON,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE
        },
        updatedAt: {
            type: DataTypes.DATE
        },
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });

    // eslint-disable-next-line no-unused-vars
    offerCache.associate = function (models) {
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
    };

    return offerCache;
};
