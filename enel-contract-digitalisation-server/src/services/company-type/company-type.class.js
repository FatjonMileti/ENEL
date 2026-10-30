/* eslint-disable no-unused-vars */

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async find() {

        return {
            data: [
                {label: "PFA", value: "Persoana fizica autorizata"},
                {label: "ONG", value: "ONG"},
                {label: "Agentie imobiliara", value: "Agentie imobiliara"},
                {label: "Asociatie de proprietari", value: "Asociatie de proprietari"},
                {label: "Ambasada", value: "Ambasada"},
                {label: "Asociatie familiala", value: "Asociatie familiala"},
                {label: "Institutie publica", value: "Institutie publica"},
                {label: "Societate comerciala", value: "Societate comerciala"},
                {label: "Anonim", value: "Anonim"}
            ]
        };
    };

    setup(app) {
        this.app = app;
    }

}

module.exports = function (options) {
    return new Service(options);
};

module.exports.Service = Service;
