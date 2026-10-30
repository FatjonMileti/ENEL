/* eslint-disable no-unused-vars */
const { BadRequest } = require('@feathersjs/errors');
const request = require('request');
const { trim } = require('../../utils/common.js');

const POD_DISTRIBUTORS = {
    '00': 'D_RO10976687_1', //Delgaz Grid S.A. (Electricitate))
    '01': 'D_14491102',   //Distributie Energie Oltenia SA
    '02': 'D_14476722',   //Distributie Energie Electrica Romania
    '03': 'D_14476722',   //Distributie Energie Electrica Romania
    '04': 'D_14476722',   //Distributie Energie Electrica Romania
};

const CLC_DISTRIBUTORS = {
    'ADS': 'D_RO24913735', //Amarad
    'BDS': 'D_RO14380376', //S.C.BERG SISTEM GAZ S.A.
    'CON': null,           //
    'CGZ': 'D_RO14674746', //CORDUN GAZ SA
    'COV': 'D_11812933',   //COVI CONSTRUCT 2000SRL
    'CPL': 'D_RO14895720', //CPL Concordia
    'DEG': 'D_RO10976687', //Delgaz Grid S.A. (Gaz)
    'DZP': 'D_RO13851874', //DESIGN PROIECT SRL
    'DGS': 'D_23308833',   //DISTRIGAZ SUD RETELE SRL
    'DGV': 'D_RO14370054', //DISTRIGAZ VEST
    'ESV': 'D_RO13310879', //SC EURO SEVEN INDUSTRY SRL
    'GVS': 'D_RO14679859', //GAZ EST
    'GNE': 'D_RO14773987', //GAZ NORD EST
    'GZV': 'D_RO32985414', //GAZ VEST
    'GZM': 'D_28259650',   //GAZMIR IASI SRL
    'HRG': 'D_RO13861940', //S.C. HARGAZ HARGHITA GAZ S.A.
    'ICC': 'D_RO14390680', //INSTANT CONSTRUCT COMPANY S.A.
    'MMD': 'D_RO3156242',  //M.M.DATA S.R.L.
    'MGZ': 'D_RO26043900', //SC MACIN GAZ SRL
    'MGA': 'D_RO3507416',  //MEGACONSTRUCT SA
    'MHG': 'D_RO16144762', //MEHEDINTI GAZ
    'MHC': 'D_RO8137551',  //Mihoc Oil
    'NGZ': 'D_RO14105694', //NORD GAZ SRL
    'NPG': 'D_18680651',   //NOVA POWER & GAS SRL
    'OLG': 'D_RO13693642', //SC OLIGOPOL SRL
    'OTO': 'D_RO11261192', //OTTO GAZ SRL
    'PEY': 'D_RO20914495', //PREMIER ENERGY SRL
    'PEYTR': 'D_RO20914495',//PREMIER ENERGY SRL Zimnicea
    'PRI': 'D_RO13991843', //Prisma Serv Company
    'PRG': 'D_13518234',   //PROGAZ DISTRIBUTION SA
    'RGZ': null,
    'SLG': 'D_RO14520895', //Salgaz
    'THR': 'D_RO4022079',  //TEHNOLOGICA RADION SRL
    'TMG': 'D_RO12519622', //TIMGAZ S.A.
    'TLG': 'D_15480128',   //TULCEA GAZ SA prin O.E.ROYAL SERVICE SRL
    'VEG': 'D_3118800',    //VEGA 93 SRL
    'WRG': 'D_RO6090967',  //WIROM GAS S.A
    'OLZ': 'D_RO13693642', //SC OLIGOPOL SRL
    'ROC': 'D_32740775', //DORNACOR INVEST S.R.L.
    'PLK': null,
    'ARC': null,
    'AMR': null,
    'FSC': null,
    'LOT': null,
    'PET': '0010Q00000uceJsQAI', //OMV PETROM S.A. D_RO1590082
    'RAF': null,
    'RGA': null,
    'SER': null,
    'HOC': null,
};

const COUNTIES = {
    '0101': 'DJ', // Dolj
    '0102': 'AG', // Arges
    '0103': 'GJ', // Gorj
    '0104': 'MH', // Mehedinti
    '0105': 'OT', // Olt
    '0106': 'TR', // Teleorman
    '0107': 'VL', // Valcea
    '0201': 'BV', // Brasov
    '0202': 'SB', // Sibiu
    '0203': 'MS', // Mures
    '0204': 'AB', // Alba
    '0205': 'HR', // Harghita
    '0206': 'CV', // Covasna
    '0301': 'PH', // Prahova
    '0302': 'BR', // Braila
    '0303': 'BZ', // Buzau
    '0304': 'VN', // Vrancea
    '0305': 'GL', // Galati
    '0306': 'DB', // Dambovita
    '0401': 'CJ', // Cluj
    '0402': 'BH', // Bihor
    '0403': 'MM', // Maramures
    '0404': 'BN', // Bistrita-Nasaud
    '0405': 'SM', // Satu Mare
    '0406': 'SJ', // Salaj
}

class Service {

    constructor(options) {
        this.options = options || {};
    }

    getPODDistributor(key) {
        return POD_DISTRIBUTORS[key] ? this.distributors.find(item => item.internal_id == POD_DISTRIBUTORS[key]) : undefined;
    }

    getCLCDistributor(key) {
        return CLC_DISTRIBUTORS[key] ? this.distributors.find(item => item.internal_id == CLC_DISTRIBUTORS[key]) : undefined;
    }

    getCounty(key) {
        return COUNTIES[key] ? this.counties.find(item => item.cod == COUNTIES[key]) : undefined;
    }

    async validate(nlc) {
        if (!nlc || !nlc.length) {
            return { valid: false };
        }

        this.distributors = (await this.distributorService.find()).data;
        this.counties = (await this.countyService.find()).data;

        // return {
        //     valid: true,
        //     type: 'EE',
        //     isEnel: true
        // };

/*         if (nlc.substring(0, 5) == 'PEYTR') {
            return {
                valid: true,
                distributor: this.getCLCDistributor('PEYTR'),
                type: 'GAZ',
            }
        } */

        if (Object.keys(CLC_DISTRIBUTORS).includes(nlc.substring(0, 3))) {
            return {
                valid: true,
                distributor: this.getCLCDistributor(nlc.substring(0, 3)),
                type: 'GAZ',
            }
        }

        if (nlc.length == 10 && nlc.substring(0, 3) == 'EMO' /* && nlc.substring(7, 10) !== '000' */) {
            return {
                valid: true,
                distributor: this.getPODDistributor('00'),
                type: 'EE',
                isEnel: false,
            };
        }

        if (((nlc.length == 26 && nlc.substring(3, 5) == '01') || (nlc.length == 18 && ['02', '03', '04'].includes(nlc.substring(3, 5))))
            && nlc.substring(0, 3) == '594' /* && nlc.substring(nlc.length - 3, nlc.length) != '000' */) {

            if (nlc.length == 26 && !['01', '02', '03', '04', '05', '06', '07'].includes(nlc.substring(5, 7))) {
                return { valid: false };
            }

            if (nlc.length == 18 && !['01', '02', '03', '04', '05', '06'].includes(nlc.substring(5, 7))) {
                return { valid: false };
            }

            return {
                valid: true,
                distributor: this.getPODDistributor(nlc.substring(3, 5)),
                county: this.getCounty(nlc.substring(3, 7)),
                type: 'EE',
                isEnel: false,
            };
        /*  const base = nlc.substring(0, 17) + '0';

            let acc = 0
            for (let i = 0; i < 9; i++) {
                acc += parseInt(base[2 * i]) * 3;
                acc += parseInt(base[2 * i + 1]);
            }

            let rest = acc % 10
            if (rest) rest = 10 - rest;

            if (rest == nlc[17]) {
                return {
                    valid: true,
                    distributor: this.getPODDistributor(nlc.substring(3, 5)),
                    county: this.getCounty(nlc.substring(3, 7)),
                    type: 'EE',
                    isEnel: false,
                };
            } */
        }

        if (nlc.substr(0, 4) === 'RO00') {
            return {
                valid: true,
                type: 'EE',
                isEnel: true,
            };
        }

        return { valid: false };
    }

    async get(nlc) {
        nlc = trim(nlc);
        return await this.validate(nlc.toString());
    }

    setup(app) {
        this.app = app;
        this.distributorService = app.service('distribuitor');
        this.countyService = app.service('judet');
    }
}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
