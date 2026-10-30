/* eslint-disable no-unused-vars */
const SoapWrapper = require('../../internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();
const {formatDate} = require('../../utils/common')

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async find(params) {
        const today = new Date();
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const result = await soapMethods.wsSAPQueryIdx({
            END_DATE: formatDate(today),
            START_DATE: formatDate(twoYearsAgo),
            ENELID: params.query.ENELID
        });
        let uniqueLatestIndexes = [];
        if (result && result.CITIRI && result.CITIRI.item) {
            if (result.CITIRI.item instanceof Array) {
                uniqueLatestIndexes = result.CITIRI.item.reduce((totalItems, currItem) => {
                    const sameIdIndex = totalItems.findIndex(item => item.ID_CADRAN === currItem.ID_CADRAN);
                    if (sameIdIndex > -1) {
                        if (currItem.STARE_CITIRE === 'Preluat' && currItem.DATA_CITIRE > totalItems[sameIdIndex].DATA_CITIRE) {
                            totalItems[sameIdIndex] = {
                                ID_CADRAN: currItem.ID_CADRAN,
                                CADRAN: currItem.CADRAN,
                                INDEX: currItem.INDEX
                            };
                        }
                    } else {
                        if (currItem.STARE_CITIRE === 'Preluat') {
                            totalItems.push({
                                ID_CADRAN: currItem.ID_CADRAN,
                                CADRAN: currItem.CADRAN,
                                INDEX: currItem.INDEX
                            });
                        }
                    }
                    return totalItems
                }, []);
            }
            else {
                uniqueLatestIndexes.push({
                    ID_CADRAN: result.CITIRI.item.ID_CADRAN,
                    CADRAN: result.CITIRI.item.CADRAN,
                    INDEX: result.CITIRI.item.INDEX
                });
            }
        }
        return {
            INDEXES: uniqueLatestIndexes,
            SERIE_CONTOR: result.SERIE_CONTOR

        }
    }

    setup(app) {
        this.app = app;
        this.sessionService = this.app.service('session');
    }

}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
