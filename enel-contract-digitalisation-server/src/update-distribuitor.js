require('dotenv').config();
const Sequelize = require('sequelize');
const Session = require('./models/session.model');
const User = require('./models/users.model')

const app = require("./app");
const Op = Sequelize.Op;

//QAS
// const OLD_DISTRIBUTIONS = ["D_RO14490379","D_RO14500308"];
// const NEW_DISTRIBUTOR = "D_RO14507322";
// const PPC_MUNTENATA = "T_RO24387371";

//PRODUCTION
//RO14490379//RO14500308
const OLD_DISTRIBUTIONS = ["D_RO14490379","D_RO14500308","D_RO14507322"];
const NEW_DISTRIBUTOR = "D_RO14507322";
const PPC_MUNTENATA = "T_RO24387371";


const sessionModel = Session(app);
const userModel = User(app)

const getUseresWithEEM = async () => {
    try {
        // Count rows before update (if needed)
        const count = await userModel.count({
            where: {
                furnizor: {
                    [Op.eq]: 'EEM'
                }
            }
        });

        console.log("Update users with new zone:", count);

        // Update rows in a single query
        const [affectedRows] = await userModel.update(
            { furnizor: 'EE' }, // New value
            {
                where: {
                    furnizor: {
                        [Op.eq]: 'EEM'
                    }
                }
            }
        );

        console.log("Rows updated:", affectedRows);
    } catch (error) {
        console.error("Error updating rows:", error);
    }
}

const getInProgressSessionsEESessions = async () => {
    const rows = await sessionModel.findAll({
        where: {
            status: {
                [Op.in] :['NEW']
            },
            [Op.or]: [
                {
                    "ee_loc.furnizor_id": PPC_MUNTENATA
                },
                {
                    "ee_loc.distribuitor_id": {
                        [Op.in]: OLD_DISTRIBUTIONS
                    }
                },
            ],
        },
    });

    console.log("ELECTRIC SESSIONS:" ,rows.length)

    for (const row of rows) {
        try {
            const { dataValues } = row;

            if(OLD_DISTRIBUTIONS.includes(dataValues.ee_loc.distribuitor_id)) {
                row.set({'ee_loc.distribuitor_id': NEW_DISTRIBUTOR, 'ee_loc.distributorId': NEW_DISTRIBUTOR,'ee_loc.companie_distributie':'Retele Electrice Romania S.A.'})
                await row.save()
            }


        } catch (error) {
            console.error('Error updating row:', error);
        }
    }
}

const getInProgressGazSessions = async () => {
    const rows = await sessionModel.findAll({
        where: {
            status: {
                [Op.in] :['NEW']
            },
            [Op.or]: [
                {
                    "gaz_loc.furnizor_id": PPC_MUNTENATA
                },
                {
                    "gaz_loc.distribuitor_id": {
                        [Op.in]: OLD_DISTRIBUTIONS
                    }
                }
            ],
        },
    });

    console.log("GAS SESSIONS:", rows.length)

    for (const row of rows) {
        try {
            const { dataValues } = row;
            if(OLD_DISTRIBUTIONS.includes(dataValues.ee_loc.distribuitor_id)) {
                row.set({'ee_loc.distribuitor_id': NEW_DISTRIBUTOR, 'ee_loc.distributorId': NEW_DISTRIBUTOR,'ee_loc.companie_distributie' : 'Retele Electrice Romania S.A.'})
                await row.save();
            }

        } catch (error) {
            console.error('Error updating row:', error);
        }
    }
}


const init = async () => {
    getUseresWithEEM()
}

init();