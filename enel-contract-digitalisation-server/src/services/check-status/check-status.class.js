const { BadRequest } = require("@feathersjs/errors");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

class Service {
  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    const { sessionId, email, phone, cnp, contractType } = params.query;
    let commonCriteria = [
      {
        status: {
          [Op.and]: [{ [Op.ne]: "NEW" }, { [Op.ne]: "OFFER_ERR" }],
        },
      },
      { cron_rejection_date: { [Op.is]: null } },
      {
        abandon_type: {
          [Op.or]: [{ [Op.ne]: "AGENT_REJECT" }, { [Op.is]: null }],
        },
      },
      { type: contractType },
    ];

    if (typeof contractType !== "undefined") {
      if (contractType == "EE") {
        commonCriteria.push({
          [Op.or]: [
            { ee_last_page: { [Op.ne]: "ACTIVARE_REFUZ" } },
            { ee_last_page: { [Op.is]: null } },
          ],
        });
      } else {
        commonCriteria.push({
          [Op.or]: [
            { gaz_last_page: { [Op.ne]: "ACTIVARE_REFUZ" } },
            { gaz_last_page: { [Op.is]: null } },
          ],
        });
      }
    }

    let query = {
      where: [
        {
          [Op.and]: [...commonCriteria],
        },
      ],
    };

    if (
      typeof email !== "undefined" &&
      email !== "" &&
      (typeof phone === "undefined" ||
        (typeof phone !== "undefined" && phone === ""))
    )
      commonCriteria.push({ "client.email": email });
    else if (
      typeof phone !== "undefined" &&
      phone !== "" &&
      (typeof email === "undefined" ||
        (typeof email !== "undefined" && email === ""))
    )
      commonCriteria.push({ "client.telefon_mobil": phone });
    else if (
      typeof email !== "undefined" &&
      email !== "" &&
      typeof phone !== "undefined" &&
      phone !== ""
    )
      commonCriteria.push({
        [Op.or]: [{ "client.telefon_mobil": phone }, { "client.email": email }],
      });

    let errorMsg = "";

    if (typeof cnp === "undefined") {
      if (typeof email !== "undefined" && typeof phone !== "undefined") {
        query.where.push({
          [Op.or]: [
            { "client.email": email },
            { "client.telefon_fix": phone },
            { "client.telefon_mobil": phone },
          ],
        });

        if (typeof contractType !== "undefined") {
          switch (contractType) {
            case "EE":
              errorMsg =
                "Numarul de telefon / adresa de email au mai fost folosite cu alt CNP pentru contracte de Electricitate.";
              break;
            case "GAZ":
              errorMsg =
                "Numarul de telefon / adresa de email au mai fost folosite cu alt CNP pentru contracte de Gaz.";
              break;
          }
        } else {
          errorMsg =
            "Numarul de telefon / adresa de email au mai fost folosite cu alt CNP.";
        }
      } else if (typeof email !== "undefined") {
        query.where.push({ "client.email": email });

        if (typeof contractType !== "undefined") {
          switch (contractType) {
            case "EE":
              errorMsg =
                "Adresa de email a mai fost folosita cu alt CNP pentru contracte de Electricitate.";
              break;
            case "GAZ":
              errorMsg =
                "Adresa de email a mai fost folosita cu alt CNP pentru contracte de Gaz.";
              break;
          }
        } else {
          errorMsg = "Adresa de email a mai fost folosita cu alt CNP.";
        }
      } else if (typeof phone !== "undefined") {
        let qry = {
          [Op.or]: [
            { "client.telefon_fix": phone },
            { "client.telefon_mobil": phone },
          ],
        };

        if (phone.length === 5) {
          qry = {
            [Op.or]: [
              { "client.telefon_fix": { [Op.like]: `%${phone}` } },
              { "client.telefon_mobil": { [Op.like]: `%${phone}` } },
            ],
          };
        }

        query.where.push(qry);

        if (typeof contractType !== "undefined") {
          switch (contractType) {
            case "EE":
              errorMsg =
                "Numarul de telefon a mai fost folosit cu alt CNP pentru contracte de Electricitate.";
              break;
            case "GAZ":
              errorMsg =
                "Numarul de telefon a mai fost folosit cu alt CNP pentru contracte de Gaz.";
              break;
          }
        } else {
          errorMsg = "Numarul de telefon a mai fost folosit cu alt CNP";
        }
      } else {
        throw new BadRequest("Missing parameters.");
      }
    } else {
      if (typeof email !== "undefined" && typeof phone !== "undefined") {
        const qryObj = {
          "client.cnp": cnp,
          [Op.or]: [
            { "client.email": email },
            { "client.telefon_fix": phone },
            { "client.telefon_mobil": phone },
          ],
        };
        query.where.push(qryObj);
        /*
        if (typeof contractType !== 'undefined') {
          switch (contractType) {
            case 'EE':
              errorMsg = `Numarul de telefon / adresa de email au mai fost folosite cu acest CNP pentru ${process.env.CONTACT_DATA_LIMIT} contracte de electricitate.`;
              break;
            case 'GAZ':
              errorMsg = `Numarul de telefon / adresa de email au mai fost folosite cu acest CNP pentru ${process.env.CONTACT_DATA_LIMIT} contracte de gaz.`;
              break;
          }
        } else {
          errorMsg = 'Numarul de telefon / adresa de email au mai fost folosite cu acest CNP.';
        }
        */
      } else if (typeof email !== "undefined") {
        query.where.push({
          "client.cnp": cnp,
          "client.email": email,
        });

        // if (typeof contractType !== 'undefined') {
        //   switch (contractType) {
        //     case 'EE':
        //       errorMsg = `Adresa de email a mai fost folosita cu acest CNP pentru ${process.env.CONTACT_DATA_LIMIT} contracte de electricitate.`;
        //       break;
        //     case 'GAZ':
        //       errorMsg = `Adresa de email a mai fost folosita cu acest CNP pentru ${process.env.CONTACT_DATA_LIMIT} contracte de gaz.`;
        //       break;
        //   }
        // } else {
        //   errorMsg = 'Adresa de email a mai fost folosita cu acest CNP.';
        // }
      } else if (typeof phone !== "undefined") {
        query.where.push({
          "client.cnp": cnp,
          [Op.or]: [
            { "client.telefon_fix": phone },
            { "client.telefon_mobil": phone },
          ],
        });

        // if (typeof contractType !== 'undefined') {
        //   switch (contractType) {
        //     case 'EE':
        //       errorMsg = `Numarul de telefon a mai fost folosit cu acest CNP pentru ${process.env.CONTACT_DATA_LIMIT} contracte de electricitate.`;
        //       break;
        //     case 'GAZ':
        //       errorMsg = `Numarul de telefon a mai fost folosit cu acest CNP pentru ${process.env.CONTACT_DATA_LIMIT} contracte de gaz.`;
        //       break;
        //   }
        // } else {
        //   errorMsg = 'Numarul de telefon a mai fost folosit cu acest CNP';
        // }
      } else {
        throw new BadRequest("Missing parameters.");
      }
    }

    if (
      typeof params.user !== "undefined" &&
      params.user.type === "vi" &&
      params.user.employed === false
    ) {
      const allSessionsWithSameContact =
        await this.sessionService.Model.findAll({
          attributes: ["id", "client"],
          where: {
            [Op.and]: [...commonCriteria],
          },
          limit: 5,
        });

      let numberOfSessionsWithSameCNP = 0;
      for (let session of allSessionsWithSameContact) {
        const whitelist = await this.whitelistService.get(0, {
          query: {
            email: session.client.email,
            phone: session.client.telefon_mobil,
          },
        });

        if (session.client.cnp != cnp && !whitelist)
          throw new BadRequest(
            "Numarul de telefon / adresa de email a mai fost folosit cu un alt CNP",
          );
        else numberOfSessionsWithSameCNP++;
      }

      if (typeof process.env.CONTACT_DATA_LIMIT === "undefined") {
        throw new BadRequest(errorMsg);
      } else if (
        numberOfSessionsWithSameCNP >= parseInt(process.env.CONTACT_DATA_LIMIT)
      ) {
        if (typeof phone !== "undefined" && phone.length === 5) {
          try {
            const inDB = await this.options.Model.count({
              where: { value: phone },
            });

            if (inDB === 0) {
              await this.options.Model.create({ value: phone });
            }

            await this.appLog.create({
              sessionId,
              type: "CHECK_PHONE",
              client: params.payload.user.cid,
              payload: {
                date: new Date(),
                value: phone,
                agent_id: params.user.id,
              },
            });
          } catch (err) {
            console.log(err);
            throw new BadRequest("Could not add item.");
          }
        }

        throw new BadRequest(
          `You have exceeded the limit of ${process.env.CONTACT_DATA_LIMIT} phone numbers per session.`,
        );
      }
    }
    return { status: "OK" };
  }

  setup(app) {
    this.app = app;
    this.sessionService = this.app.service("session");
    this.whitelistService = this.app.service("whitelist");
    this.appLog = this.app.service("app-log");
  }
}

module.exports = (options) => {
  return new Service(options);
};

module.exports.Service = Service;
