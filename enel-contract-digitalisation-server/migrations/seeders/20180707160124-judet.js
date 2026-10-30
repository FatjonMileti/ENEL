'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert({ tableName: 'judet', schema: process.env.PG_SCHEMA }, [
        {
          "id": 29954,
          "denumire": "ALBA",
          "cod": "AB",
          "prefixTel": 258,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29955,
          "denumire": "ARAD",
          "cod": "AR",
          "prefixTel": 257,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29956,
          "denumire": "ARGES",
          "cod": "AG",
          "prefixTel": 248,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29957,
          "denumire": "BACAU",
          "cod": "BC",
          "prefixTel": 234,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29958,
          "denumire": "BIHOR",
          "cod": "BH",
          "prefixTel": 259,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29959,
          "denumire": "BISTRITA-NASAUD",
          "cod": "BN",
          "prefixTel": 263,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29960,
          "denumire": "BOTOSANI",
          "cod": "BT",
          "prefixTel": 231,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29961,
          "denumire": "BRAILA",
          "cod": "BR",
          "prefixTel": 239,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29962,
          "denumire": "BRASOV",
          "cod": "BV",
          "prefixTel": 268,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29963,
          "denumire": "BUCURESTI",
          "cod": "B",
          "prefixTel": 21,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29964,
          "denumire": "BUZAU",
          "cod": "BZ",
          "prefixTel": 238,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29965,
          "denumire": "CALARASI",
          "cod": "CL",
          "prefixTel": 242,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29966,
          "denumire": "CARAS-SEVERIN",
          "cod": "CS",
          "prefixTel": 255,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29967,
          "denumire": "CLUJ",
          "cod": "CJ",
          "prefixTel": 264,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29968,
          "denumire": "CONSTANTA",
          "cod": "CT",
          "prefixTel": 241,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29969,
          "denumire": "COVASNA",
          "cod": "CV",
          "prefixTel": 267,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29970,
          "denumire": "DIMBOVITA",
          "cod": "DB",
          "prefixTel": 245,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29971,
          "denumire": "DOLJ",
          "cod": "DJ",
          "prefixTel": 251,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29972,
          "denumire": "GALATI",
          "cod": "GL",
          "prefixTel": 236,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29973,
          "denumire": "GIURGIU",
          "cod": "GR",
          "prefixTel": 21,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29974,
          "denumire": "GORJ",
          "cod": "GJ",
          "prefixTel": 253,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29975,
          "denumire": "HARGHITA",
          "cod": "HR",
          "prefixTel": 266,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29976,
          "denumire": "HUNEDOARA",
          "cod": "HD",
          "prefixTel": 254,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29977,
          "denumire": "IALOMITA",
          "cod": "IL",
          "prefixTel": 243,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29978,
          "denumire": "IASI",
          "cod": "IS",
          "prefixTel": 232,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29979,
          "denumire": "ILFOV",
          "cod": "IF",
          "prefixTel": 21,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29980,
          "denumire": "MARAMURES",
          "cod": "MM",
          "prefixTel": 262,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29981,
          "denumire": "MEHEDINTI",
          "cod": "MH",
          "prefixTel": 252,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29982,
          "denumire": "MURES",
          "cod": "MS",
          "prefixTel": 265,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29983,
          "denumire": "NEAMT",
          "cod": "NT",
          "prefixTel": 233,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29984,
          "denumire": "OLT",
          "cod": "OT",
          "prefixTel": 249,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29985,
          "denumire": "PRAHOVA",
          "cod": "PH",
          "prefixTel": 244,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29986,
          "denumire": "SALAJ",
          "cod": "SJ",
          "prefixTel": 260,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29987,
          "denumire": "SATU-MARE",
          "cod": "SM",
          "prefixTel": 261,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29988,
          "denumire": "SIBIU",
          "cod": "SB",
          "prefixTel": 269,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29989,
          "denumire": "SUCEAVA",
          "cod": "SV",
          "prefixTel": 230,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29990,
          "denumire": "TELEORMAN",
          "cod": "TR",
          "prefixTel": 247,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29991,
          "denumire": "TIMIS",
          "cod": "TM",
          "prefixTel": 256,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29992,
          "denumire": "TULCEA",
          "cod": "TL",
          "prefixTel": 240,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29993,
          "denumire": "VASLUI",
          "cod": "VS",
          "prefixTel": 235,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29994,
          "denumire": "VILCEA",
          "cod": "VL",
          "prefixTel": 250,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        },
        {
          "id": 29995,
          "denumire": "VRANCEA",
          "cod": "VN",
          "prefixTel": 237,
          "createdAt": "2020-11-25T01:01:08.766Z",
          "updatedAt": "2020-11-25T01:01:08.766Z"
        }
      ], {});
    },

    down: async (queryInterface, Sequelize) => {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    }
};
