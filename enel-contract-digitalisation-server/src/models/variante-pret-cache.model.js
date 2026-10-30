const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
    const sequelizeClient = app.get('sequelizeClient');
    const users = sequelizeClient.define('variante-pret-cache',
    {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        serviciu: {type: Sequelize.STRING, allowNull: true},
        gama: {type: Sequelize.STRING, allowNull: true},
        tip: {
            type: Sequelize.STRING,
            allowNull: true
        },
        seg: {
            type: Sequelize.STRING,
            allowNull: true
        },
        segment: {
            type: Sequelize.STRING,
            allowNull: true
        },
        site: {
            type: Sequelize.STRING,
            allowNull: true
        },
        cod: {
            type: Sequelize.STRING,
            allowNull: true
        },
        combo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        denumire: {
            type: Sequelize.STRING,
            allowNull: true
        },
        de_la: {
            type: Sequelize.JSON,
            allowNull: true
        },
        pana_la: {
            type: Sequelize.JSON,
            allowNull: true
        },
        de_la_furn: {
            type: Sequelize.JSON,
            allowNull: true
        },
        pana_la_furn: {
            type: Sequelize.JSON,
            allowNull: true
        },
        pret_ea: {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_eaz:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_eanw:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_eano:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_gaz:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_tr_gaz:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        abonament:
            {
                type: Sequelize.STRING,
                allowNull: true
            },
        pret_ea_n: {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_eaz_n:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_eanw_n:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_eano_n:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_gaz_n:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        pret_tr_gaz_n:  {
            type: Sequelize.STRING,
            allowNull: true
        },
        abonament_n:
            {
                type: Sequelize.STRING,
                allowNull: true
            },
        cfe: {
            type: Sequelize.STRING,
            allowNull: true
        },
        verde: {
            type: Sequelize.STRING,
            allowNull: true
        },
        descriere_prod: {
            type: Sequelize.STRING,
            allowNull: true
        },
        descriere_prod_l: {
            type: Sequelize.STRING,
            allowNull: true
        },
        denumire_pachet: {
            type: Sequelize.STRING,
            allowNull: true
        },
        descriere_pachet: {
            type: Sequelize.STRING,
            allowNull: true
        },
        descriere_pachet_l: {
            type: Sequelize.STRING,
            allowNull: true
        },
        itemCode: {
            type: Sequelize.STRING,
            allowNull: true
        },
        sessionId: {
            type: Sequelize.STRING,
            allowNull: true
        },
        proces: {
            type: Sequelize.STRING,
            allowNull: true
        },
        subproces: {
            type: Sequelize.STRING,
            allowNull: true
        },
        judet: {
            type: Sequelize.STRING,
            allowNull: true
        },
        type: {
            type: Sequelize.STRING,
            allowNull: true
        },
        scadenta: {
            type: Sequelize.NUMBER,
            allowNull: true
        },
        furn24: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        canal: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
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
    };

    return users;
};
