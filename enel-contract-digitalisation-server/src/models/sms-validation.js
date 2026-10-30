const { Model } = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const { DataTypes } = require('sequelize');

  class SmsValidation extends Model {
    static associate(models) {
      // define associations here
    }
  }

  SmsValidation.init({
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isFinished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attemptsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    validatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    session: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize: sequelizeClient,
    modelName: 'SmsValidation',
    tableName: 'sms_validations',
    timestamps: true,
  });

  return SmsValidation;
}; 