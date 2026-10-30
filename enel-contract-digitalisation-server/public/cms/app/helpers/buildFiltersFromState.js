module.exports = {
    forSession: state => {
        let filters = [];
        const products = state.ui.filters.products;
        if (products) {
            filters.push({ column: 'type', value: products });
        }

        const companies = state.ui.filters.companies;
        if (companies) {
            filters.push({ column: '$agent.companyId$', value: companies });
        }

        const workingRegions = state.ui.filters.workingRegions;
        if (workingRegions) {
            filters.push({ column: '$agent.workingRegion$', value: workingRegions });
        }

        const counties = state.ui.filters.counties;
        if (counties) {
            filters.push({ column: '$agent.county$', value: counties });
        }

        const agents = state.ui.filters.agents;
        if (agents) {
            filters.push({ column: 'agent_id', value: agents });
        }

        const marca = state.ui.filters.marca;
        if (marca) {
            filters.push({ column: '$agent.marca$', value: marca });
        }

        const pages = state.ui.filters.pages;
        if (pages) {
            filters.push({ column: '$or[10][type]', value: 'EE' });
            filters.push({ column: '$or[10][ee_last_page]', value: pages });

            filters.push({ column: '$or[11][type]', value: 'GAZ' });
            filters.push({ column: '$or[11][gaz_last_page]', value: pages });

            filters.push({ column: '$or[12][type]', value: 'COMBO' });
            filters.push({ column: '$or[12][ee_last_page]', value: pages });
            filters.push({ column: '$or[12][gaz_last_page]', value: pages });
        }

        const abandonTypes = state.ui.filters.abandonTypes;
        if (abandonTypes) {
            filters.push({ column: 'abandon_type', value: abandonTypes });
        }

        // configurare canale parteneri punct ppc
        const channels = state.ui.filters.channels;
        const saleType = state.ui.filters.saleType;
        if (channels) {
            switch (channels) {
                case '2': //partener
                    if (saleType && saleType.toString() === '0') {
                        filters.push({ column: '$agent.type$', value: 'vi' });
                        filters.push({ column: '$agent.employed$', value: 'false' });
                        filters.push({ column: 'client_app', value: window.ANDROID_APP1 });
                    } else if (saleType && saleType.toString() === '1') {
                        filters.push({ column: '$agent.type$', value: 'vi' });
                        filters.push({ column: '$agent.employed$', value: 'true' });
                        filters.push({ column: 'client_app', value: window.ANDROID_APP1 });
                    } else if (saleType && saleType.toString() === '2') {
                        filters.push({ column: '$agent.type$', value: 'vi' });
                        filters.push({ column: 'client_app', value: window.TELESALES_AGENT_APP });
                    } else if (saleType && saleType.toString() === '3') {
                        filters.push({ column: '$agent.type$', value: 'li' });
                        filters.push({ column: '$agent.employed$', value: 'false' });
                        filters.push({ column: 'client_app', value: window.ANDROID_APP1 });
                    } else {
                        filters.push({ column: '$agent.type$', value: 'vi' });
                        filters.push({ column: 'client_app[$in]', value: window.ANDROID_APP1 });
                        filters.push({ column: 'client_app[$in]', value: window.TELESALES_AGENT_APP });
                    }
                    break;
                case '3': //punct ppc
                    filters.push({ column: '$agent.type$', value: 'pe' });
                    //filters.push({ column: 'client_app', value: window.ANDROID_APP1 });
                    // filters.push({ column: '$agent.employed$', value: 'true' });
                    break;
                case '5': //infokiosk
                    filters.push({ column: '$agent.type$', value: 'ik' });
                    filters.push({ column: 'client_app', value: window.ANDROID_APP1 });
                    // filters.push({ column: '$agent.employed$', value: 'true' });
                    break;
                case '6': //web
                    filters.push({ column: 'client_app', value: window.WEB_APP });
                    break;
                case '7': //d2d
                    filters.push({ column: 'client_app', value: window.ANDROID_APP1 });
                    break;
                case '8': //office
                    filters.push({ column: 'client_app', value: window.CMS });
                    break;
                case '4': //call center
                    filters.push({ column: '$agent.type$', value: 'cc' });
                    filters.push({ column: 'client_app', value: window.TELESALES_AGENT_APP });
                    break;
            }
        }


        //probabil trebuie sa mutam statusurile si restul de coloane calculate pe tabela de sesiune.
        //la fiecare patch sa se recalculeze
        const statuses = state.ui.filters.statuses;
        if (statuses) {
            switch (statuses) {
                case 'ACTIVATED':
                    filters.push({ column: '$or[10][type]', value: 'EE' });
                    filters.push({ column: '$or[10][ee_agree]', value: 'true' });

                    filters.push({ column: '$or[11][type]', value: 'GAZ' });
                    filters.push({ column: '$or[11][gaz_agree]', value: 'true' });

                    filters.push({ column: '$or[12][type]', value: 'COMBO' });
                    filters.push({ column: '$or[12][ee_agree]', value: 'true' });
                    filters.push({ column: '$or[12][gaz_agree]', value: 'true' });
                    break;
                case 'PENDING':
                    //$ne genereaza <> true si le ignora cu deavarsire pe cele cu null
                    //daca pui ambele conditii.. null si false genereaza in(false, null) si postgres nu recunoaste
                    filters.push({ column: '$or[11][type]', value: 'EE' });
                    filters.push({ column: '$or[11][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[11][ee_sign_success]', value: 'true' });

                    filters.push({ column: '$or[12][type]', value: 'GAZ' });
                    filters.push({ column: '$or[12][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[12][gaz_sign_success]', value: 'true' });

                    filters.push({ column: '$or[13][type]', value: 'COMBO' });
                    filters.push({ column: '$or[13][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[13][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[13][ee_sign_success]', value: 'true' });
                    filters.push({ column: '$or[13][gaz_sign_success]', value: 'true' });

                    filters.push({ column: '$or[14][type]', value: 'COMBO' });
                    filters.push({ column: '$or[14][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[14][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[14][ee_sign_success]', value: 'null' });
                    filters.push({ column: '$or[14][gaz_sign_success]', value: 'true' });

                    filters.push({ column: '$or[15][type]', value: 'COMBO' });
                    filters.push({ column: '$or[15][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[15][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[15][ee_sign_success]', value: 'true' });
                    filters.push({ column: '$or[15][gaz_sign_success]', value: 'null' });
                    break;
                case 'REJECTED':
                    filters.push({ column: '$or[10][ee_agree]', value: 'false' });
                    filters.push({ column: '$or[11][gaz_agree]', value: 'false' });
                    break;
                case 'ERRORED':
                    filters.push({ column: '$or[10][ee_offer_success]', value: 'false' });
                    filters.push({ column: '$or[11][gaz_offer_success]', value: 'false' });
                    filters.push({ column: '$or[12][ee_sign_success]', value: 'false' });
                    filters.push({ column: '$or[13][gaz_sign_success]', value: 'false' });
                    filters.push({ column: '$or[14][ee_activate_success]', value: 'false' });
                    filters.push({ column: '$or[15][gaz_activate_success]', value: 'false' });
                    break;
                case 'UNFINISHED':
                    filters.push({ column: '$or[10][type]', value: 'EE' });
                    filters.push({ column: '$or[10][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[10][ee_sign_success]', value: 'null' });
                    filters.push({ column: '$or[10][ee_offer_success]', value: 'null' });
                    filters.push({ column: '$or[11][type]', value: 'EE' });
                    filters.push({ column: '$or[11][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[11][ee_sign_success]', value: 'null' });
                    filters.push({ column: '$or[11][ee_offer_success]', value: 'true' });

                    filters.push({ column: '$or[12][type]', value: 'GAZ' });
                    filters.push({ column: '$or[12][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[12][gaz_sign_success]', value: 'null' });
                    filters.push({ column: '$or[12][gaz_offer_success]', value: 'null' });
                    filters.push({ column: '$or[13][type]', value: 'GAZ' });
                    filters.push({ column: '$or[13][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[13][gaz_sign_success]', value: 'null' });
                    filters.push({ column: '$or[13][gaz_offer_success]', value: 'true' });

                    filters.push({ column: '$or[14][type]', value: 'COMBO' });
                    filters.push({ column: '$or[14][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[14][ee_sign_success]', value: 'null' });
                    filters.push({ column: '$or[14][ee_offer_success]', value: 'null' });
                    filters.push({ column: '$or[14][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[14][gaz_sign_success]', value: 'null' });
                    filters.push({ column: '$or[14][gaz_offer_success]', value: 'null' });
                    filters.push({ column: '$or[15][type]', value: 'COMBO' });
                    filters.push({ column: '$or[15][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[15][ee_sign_success]', value: 'null' });
                    filters.push({ column: '$or[15][ee_offer_success]', value: 'true' });
                    filters.push({ column: '$or[15][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[15][gaz_sign_success]', value: 'null' });
                    filters.push({ column: '$or[15][gaz_offer_success]', value: 'null' });
                    filters.push({ column: '$or[16][type]', value: 'COMBO' });
                    filters.push({ column: '$or[16][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[16][ee_sign_success]', value: 'null' });
                    filters.push({ column: '$or[16][ee_offer_success]', value: 'null' });
                    filters.push({ column: '$or[16][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[16][gaz_sign_success]', value: 'null' });
                    filters.push({ column: '$or[16][gaz_offer_success]', value: 'true' });
                    filters.push({ column: '$or[17][type]', value: 'COMBO' });
                    filters.push({ column: '$or[17][ee_agree]', value: 'null' });
                    filters.push({ column: '$or[17][ee_sign_success]', value: 'null' });
                    filters.push({ column: '$or[17][ee_offer_success]', value: 'true' });
                    filters.push({ column: '$or[17][gaz_agree]', value: 'null' });
                    filters.push({ column: '$or[17][gaz_sign_success]', value: 'null' });
                    filters.push({ column: '$or[17][gaz_offer_success]', value: 'true' });

                    filters.push({ column: '$or[9][type]', value: 'null' });
                    break;
            }
        }

        const since = state.ui.startDate;
        const until = state.ui.endDate;
        if (since && until) {
            filters.push({ column: 'createdAt[$gte]', value: moment(since).startOf('day').format('YYYYMMDD') });
            filters.push({ column: 'createdAt[$lt]', value: moment(until).startOf('day').format('YYYYMMDD') });
        }

        return filters;
    },
    forAppLog: state => {
        let filters = [];
        const products = state.ui.filters.products;
        if (products) {
            filters.push({ column: '$session.type$', value: products });
        }

        const companies = state.ui.filters.companies;
        if (companies) {
            filters.push({ column: '$session.agent.companyId$', value: companies });
        }

        const workingRegions = state.ui.filters.workingRegions;
        if (workingRegions) {
            filters.push({ column: '$session.agent.workingRegion$', value: workingRegions });
        }

        const counties = state.ui.filters.counties;
        if (counties) {
            filters.push({ column: '$session.agent.county$', value: counties });
        }

        const agents = state.ui.filters.agents;
        if (agents) {
            filters.push({ column: '$session.agent_id$', value: agents });
        }

        const marca = state.ui.filters.marca;
        if (marca) {
            filters.push({ column: '$session.agent.marca$', value: marca });
        }

        const pages = state.ui.filters.pages;
        if (pages) {
            filters.push({ column: '$or[10][$session.type$]', value: 'EE' });
            filters.push({ column: '$or[10][$session.ee_last_page$]', value: pages });

            filters.push({ column: '$or[11][$session.type$]', value: 'GAZ' });
            filters.push({ column: '$or[11][$session.gaz_last_page$]', value: pages });

            filters.push({ column: '$or[12][$session.type$]', value: 'COMBO' });
            filters.push({ column: '$or[12][$session.ee_last_page$]', value: pages });
            filters.push({ column: '$or[12][$session.gaz_last_page$]', value: pages });
        }

        const abandonTypes = state.ui.filters.abandonTypes;
        if (abandonTypes) {
            filters.push({ column: '$session.abandon_type$', value: abandonTypes });
        }

        // configurare canale parteneri punct ppc
        const channels = state.ui.filters.channels;
        if (channels) {
            switch (channels) {
                case '3': //punct ppc
                    filters.push({ column: '$session.agent.type$', value: 'pe' });
                    // filters.push({ column: '$session.agent.employed$', value: 'true' });
                    break;
                case '5': //infokiosk
                    filters.push({ column: '$session.agent.type$', value: 'ik' });
                    // filters.push({ column: '$session.agent.employed$', value: 'true' });
                    break;
                case '6': //web
                    filters.push({ column: 'client', value: window.WEB_APP });
                    break;
                case '2': //partener
                    filters.push({ column: '$session.agent.type$', value: 'vi' });
                    break;
            }
        }

        const saleType = state.ui.filters.saleType;
        if (saleType && saleType.toString() === '0') {
            filters.push({ column: '$session.agent.employed$', value: 'false' });
            filters.push({ column: '$session.agent.type$', value: 'vi' });
            filters.push({ column: 'client', value: window.ANDROID_APP1 });
        } else if (saleType && saleType.toString() === '1') {
            filters.push({ column: '$session.agent.employed$', value: 'true' });
            filters.push({ column: '$session.agent.type$', value: 'vi' });
            filters.push({ column: 'client', value: window.ANDROID_APP1 });
        } else if (saleType && saleType.toString() === '2') {
            filters.push({ column: '$session.agent.type$', value: 'cc' });
            filters.push({ column: 'client', value: window.TELESALES_AGENT_APP });
        } else if (saleType && saleType.toString() === '3') {
            filters.push({ column: '$agent.type$', value: 'li' });
            filters.push({ column: '$agent.employed$', value: 'false' });
            filters.push({ column: 'client_app', value: window.ANDROID_APP1 });
        }

        const statuses = state.ui.filters.statuses;
        if (statuses) {
            switch (statuses) {
                case 'ACTIVATED':
                    filters.push({ column: '$or[10][$session.type$]', value: 'EE' });
                    filters.push({ column: '$or[10][$session.ee_agree$]', value: 'true' });

                    filters.push({ column: '$or[11][$session.type$]', value: 'GAZ' });
                    filters.push({ column: '$or[11][$session.gaz_agree$]', value: 'true' });

                    filters.push({ column: '$or[12][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[12][$session.ee_agree$]', value: 'true' });
                    filters.push({ column: '$or[12][$session.gaz_agree$]', value: 'true' });
                    break;
                case 'PENDING':
                    filters.push({ column: '$or[11][$session.type$]', value: 'EE' });
                    filters.push({ column: '$or[11][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[11][$session.ee_sign_success$]', value: 'true' });

                    filters.push({ column: '$or[12][$session.type$]', value: 'GAZ' });
                    filters.push({ column: '$or[12][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[12][$session.gaz_sign_success$]', value: 'true' });

                    filters.push({ column: '$or[13][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[13][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[13][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[13][$session.ee_sign_success$]', value: 'true' });
                    filters.push({ column: '$or[13][$session.gaz_sign_success$]', value: 'true' });

                    filters.push({ column: '$or[14][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[14][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.ee_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.gaz_sign_success$]', value: 'true' });

                    filters.push({ column: '$or[15][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[15][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[15][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[15][$session.ee_sign_success$]', value: 'true' });
                    filters.push({ column: '$or[15][$session.gaz_sign_success$]', value: 'null' });
                    break;
                case 'REJECTED':
                    filters.push({ column: '$or[10][$session.ee_agree$]', value: 'false' });
                    filters.push({ column: '$or[11][$session.gaz_agree$]', value: 'false' });
                    break;
                case 'ERRORED':
                    filters.push({ column: '$or[10][$session.ee_offer_success$]', value: 'false' });
                    filters.push({ column: '$or[11][$session.gaz_offer_success$]', value: 'false' });
                    filters.push({ column: '$or[12][$session.ee_sign_success$]', value: 'false' });
                    filters.push({ column: '$or[13][$session.gaz_sign_success$]', value: 'false' });
                    filters.push({ column: '$or[14][$session.ee_activate_success$]', value: 'false' });
                    filters.push({ column: '$or[15][$session.gaz_activate_success$]', value: 'false' });
                    break;
                case 'UNFINISHED':
                    filters.push({ column: '$or[10][$session.type$]', value: 'EE' });
                    filters.push({ column: '$or[10][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[10][$session.ee_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[10][$session.ee_offer_success$]', value: 'null' });
                    filters.push({ column: '$or[11][$session.type$]', value: 'EE' });
                    filters.push({ column: '$or[11][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[11][$session.ee_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[11][$session.ee_offer_success$]', value: 'true' });

                    filters.push({ column: '$or[12][$session.type$]', value: 'GAZ' });
                    filters.push({ column: '$or[12][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[12][$session.gaz_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[12][$session.gaz_offer_success$]', value: 'null' });
                    filters.push({ column: '$or[13][$session.type$]', value: 'GAZ' });
                    filters.push({ column: '$or[13][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[13][$session.gaz_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[13][$session.gaz_offer_success$]', value: 'true' });

                    filters.push({ column: '$or[14][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[14][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.ee_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.ee_offer_success$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.gaz_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[14][$session.gaz_offer_success$]', value: 'null' });
                    filters.push({ column: '$or[15][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[15][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[15][$session.ee_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[15][$session.ee_offer_success$]', value: 'true' });
                    filters.push({ column: '$or[15][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[15][$session.gaz_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[15][$session.gaz_offer_success$]', value: 'null' });
                    filters.push({ column: '$or[16][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[16][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[16][$session.ee_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[16][$session.ee_offer_success$]', value: 'null' });
                    filters.push({ column: '$or[16][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[16][$session.gaz_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[16][$session.gaz_offer_success$]', value: 'true' });
                    filters.push({ column: '$or[17][$session.type$]', value: 'COMBO' });
                    filters.push({ column: '$or[17][$session.ee_agree$]', value: 'null' });
                    filters.push({ column: '$or[17][$session.ee_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[17][$session.ee_offer_success$]', value: 'true' });
                    filters.push({ column: '$or[17][$session.gaz_agree$]', value: 'null' });
                    filters.push({ column: '$or[17][$session.gaz_sign_success$]', value: 'null' });
                    filters.push({ column: '$or[17][$session.gaz_offer_success$]', value: 'true' });

                    filters.push({ column: '$or[9][$session.type$]', value: 'null' });
                    break;
            }
        }

        const since = state.ui.startDate;
        const until = state.ui.endDate;
        if (since && until) {
            filters.push({ column: 'createdAt[$gte]', value: moment(since).startOf('day').format('YYYYMMDD') });
            filters.push({ column: 'createdAt[$lt]', value: moment(until).startOf('day').format('YYYYMMDD') });
        }

        return filters;
    }
};