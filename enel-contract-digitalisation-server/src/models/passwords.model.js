const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
    const sequelizeClient = app.get('sequelizeClient');
    const passwords = sequelizeClient.define('passwords', {
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            beforeCount(options) {
                options.raw = true;
            }
        }
    });

    // eslint-disable-next-line no-unused-vars
    passwords.associate = function(models) {
        passwords.belongsTo(models['users']);
    };

    return passwords;
};