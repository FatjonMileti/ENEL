const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
    const sequelizeClient = app.get('sequelizeClient');
    const users = sequelizeClient.define('users', {
        marca: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        employed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        furnizor: {
            type: DataTypes.STRING(5),
            allowNull: true,
            defaultValue: null
        },
        pin: {
            type: DataTypes.STRING(5),
            allowNull: true,
            defaultValue: null
        },
        lastLogin: DataTypes.DATE,
        failedLogins: DataTypes.INTEGER,
        maxPassReachDate: DataTypes.DATE,
        companyId: { type: DataTypes.STRING, allowNull: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        establishmentAddress: { type: DataTypes.STRING, allowNull: true },
        workingRegion: { type: DataTypes.STRING, allowNull: true },
        county: { type: DataTypes.STRING, allowNull: true },
        city: { type: DataTypes.STRING, allowNull: true },
        solicitationDate: { type: DataTypes.STRING, allowNull: true },
        validityStartDate: { type: DataTypes.STRING, allowNull: true },
        validityEndDate: { type: DataTypes.STRING, allowNull: true },
        managerMarca: { type: DataTypes.STRING, allowNull: true },
        notes: { type: DataTypes.STRING, allowNull: true }
    }, {
            hooks: {
                beforeCount(options) {
                    options.raw = true;
                }
            }
        });

    // eslint-disable-next-line no-unused-vars
    users.associate = function (models) {
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
        // users.belongsTo(models['company']);
        users.belongsTo(models['canal'], { foreignKey: 'companyId', targetKey: 'internal_id', constraints: false, as: 'canal' });
        users.belongsTo(models['users'], { foreignKey: 'managerMarca', targetKey: 'marca', as: 'manager' });
    };

    return users;
};
