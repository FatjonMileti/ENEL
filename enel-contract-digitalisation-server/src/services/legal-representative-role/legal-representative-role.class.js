/* eslint-disable no-unused-vars */

class Service {
    constructor(options) {
        this.options = options || {};
    }

    async find() {

        return {
            data: [
                {label: "Utilizator Business", value: "Utilizator Business"},
                {label: "Factor de decizie", value: "Factor de decizie"},
                {label: "Cumparator", value: "Cumparator"},
                {label: "Factor decizie cumparator", value: "Factor decizie cumparator"},
                {label: "Evaluator", value: "Evaluator"},
                {label: "Sponsor executive", value: "Sponsor executive"},
                {label: "Influencer", value: "Influencer"},
                {label: "Cumparator tehnic", value: "Cumparator tehnic"},
                {label: "Altul", value: "Altul"}
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
