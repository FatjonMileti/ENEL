import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';

class FiltersService {
    filterImport(items, uiFilters, searchFilter) {
        const searchFields = ['firstName', 'lastName', 'fullName', 'phone', 'mobile', 'cnp'];
        const filtered = {};
        for (let key in items) {
            let skip = false;
            for (let filterKey in uiFilters) {
                if (uiFilters[filterKey] && items[key][filterKey] !== uiFilters[filterKey]) {
                    skip = true;
                    break;
                }
            }
            if (!skip && searchFilter) {
                let found = false;
                for (let index in searchFields) {
                    const searchField = searchFields[index];
                    if (
                        items[key][searchField] &&
                        items[key][searchField]
                            .toString()
                            .toLowerCase()
                            .match(searchFilter.toLowerCase())
                    ) {
                        found = true;
                        break;
                    }
                }
                if (!found) skip = true;
            }
            if (!skip) filtered[key] = items[key];
        }
        return filtered;
    }

    buildFilters(uiFilters) {
        const filters = { ...uiFilters };
        _.each(filters, (value, key) => {
            if (value === '') delete filters[key];
        });

        if (filters.status) {
            switch (filters.status) {
                case 'CLIENT_OFFER_ACCEPTED':
                    filters['$session.status$'] = 'NEW';
                    filters['$session.link_sent_date$'] = 'null';
                    break;

                //case 'CLIENT_OFFER_SENT':
                //    filters['$session.status$'] = 'NEW';
                //    filters['$not[$session.link_sent_date$]'] = 'null';
                //    break;

                case 'CLIENT_DOCS_NOT_UPLOADED':
                    filters['$session.status$'] = 'NEW';
                    filters['$session.client_upload_agree_date$'] = 'null';
                    filters['$not[$session.link_sent_date$]'] = 'null';
                    break;

                case 'CLIENT_DOCS_UPLOADED':
                    filters['$session.status$'] = 'NEW';
                    filters['$not[$session.client_upload_agree_date$]'] = 'null';
                    break;

                case 'CLIENT_CONTRACT_SENT_SMS':
                    filters['$session.status$'] = 'SIGN';

                    filters['$or[10][$session.ee_sign_success$]'] = 'true';
                    filters['$or[10][$session.ee_sign_channel$]'] = 'SMS';

                    filters['$or[11][$session.gaz_sign_success$]'] = 'true';
                    filters['$or[11][$session.gaz_sign_channel$]'] = 'SMS';
                    break;

                case 'CLIENT_CONTRACT_SENT_EMAIL':
                    filters['$session.status$'] = 'SIGN';

                    filters['$or[10][$session.ee_sign_success$]'] = 'true';
                    filters['$or[10][$session.ee_sign_channel$]'] = 'EMAIL';

                    filters['$or[11][$session.gaz_sign_success$]'] = 'true';
                    filters['$or[11][$session.gaz_sign_channel$]'] = 'EMAIL';
                    break;

                case 'ACTIVATED':
                    filters['$or[10][$session.type$]'] = 'EE';
                    filters['$or[10][$session.ee_agree$]'] = 'true';

                    filters['$or[11][$session.type$]'] = 'GAZ';
                    filters['$or[11][$session.gaz_agree$]'] = 'true';

                    filters['$or[12][$session.type$]'] = 'COMBO';
                    filters['$or[12][$session.ee_agree$]'] = 'true';
                    filters['$or[12][$session.gaz_agree$]'] = 'true';
                    break;

                case 'PENDING':
                    filters['$or[11][$session.type$]'] = 'EE';
                    filters['$or[11][$session.ee_agree$]'] = 'null';
                    filters['$or[11][$session.ee_sign_success$]'] = 'true';

                    filters['$or[12][$session.type$]'] = 'GAZ';
                    filters['$or[12][$session.gaz_agree$]'] = 'null';
                    filters['$or[12][$session.gaz_sign_success$]'] = 'true';

                    filters['$or[13][$session.type$]'] = 'COMBO';
                    filters['$or[13][$session.ee_agree$]'] = 'null';
                    filters['$or[13][$session.gaz_agree$]'] = 'null';
                    filters['$or[13][$session.ee_sign_success$]'] = 'true';
                    filters['$or[13][$session.gaz_sign_success$]'] = 'true';

                    filters['$or[14][$session.type$]'] = 'COMBO';
                    filters['$or[14][$session.ee_agree$]'] = 'null';
                    filters['$or[14][$session.gaz_agree$]'] = 'null';
                    filters['$or[14][$session.ee_sign_success$]'] = 'null';
                    filters['$or[14][$session.gaz_sign_success$]'] = 'true';

                    filters['$or[15][$session.type$]'] = 'COMBO';
                    filters['$or[15][$session.ee_agree$]'] = 'null';
                    filters['$or[15][$session.gaz_agree$]'] = 'null';
                    filters['$or[15][$session.ee_sign_success$]'] = 'true';
                    filters['$or[15][$session.gaz_sign_success$]'] = 'null';
                    break;

                case 'REJECTED':
                    filters['$or[10][$session.ee_agree$]'] = 'false';
                    filters['$or[11][$session.gaz_agree$]'] = 'false';
                    break;

                case 'ERRORED':
                    filters['$or[10][$session.ee_offer_success$]'] = 'false';
                    filters['$or[11][$session.gaz_offer_success$]'] = 'false';
                    filters['$or[12][$session.ee_sign_success$]'] = 'false';
                    filters['$or[13][$session.gaz_sign_success$]'] = 'false';
                    filters['$or[14][$session.ee_activate_success$]'] = 'false';
                    filters['$or[15][$session.gaz_activate_success$]'] = 'false';
                    break;

                case 'UNFINISHED':
                    filters['$or[10][$session.type$]'] = 'EE';
                    filters['$or[10][$session.ee_agree$]'] = 'null';
                    filters['$or[10][$session.ee_sign_success$]'] = 'null';
                    filters['$or[10][$session.ee_offer_success$]'] = 'null';
                    filters['$or[11][$session.type$]'] = 'EE';
                    filters['$or[11][$session.ee_agree$]'] = 'null';
                    filters['$or[11][$session.ee_sign_success$]'] = 'null';
                    filters['$or[11][$session.ee_offer_success$]'] = 'true';

                    filters['$or[12][$session.type$]'] = 'GAZ';
                    filters['$or[12][$session.gaz_agree$]'] = 'null';
                    filters['$or[12][$session.gaz_sign_success$]'] = 'null';
                    filters['$or[12][$session.gaz_offer_success$]'] = 'null';
                    filters['$or[13][$session.type$]'] = 'GAZ';
                    filters['$or[13][$session.gaz_agree$]'] = 'null';
                    filters['$or[13][$session.gaz_sign_success$]'] = 'null';
                    filters['$or[13][$session.gaz_offer_success$]'] = 'true';

                    filters['$or[14][$session.type$]'] = 'COMBO';
                    filters['$or[14][$session.ee_agree$]'] = 'null';
                    filters['$or[14][$session.ee_sign_success$]'] = 'null';
                    filters['$or[14][$session.ee_offer_success$]'] = 'null';
                    filters['$or[14][$session.gaz_agree$]'] = 'null';
                    filters['$or[14][$session.gaz_sign_success$]'] = 'null';
                    filters['$or[14][$session.gaz_offer_success$]'] = 'null';
                    filters['$or[15][$session.type$]'] = 'COMBO';
                    filters['$or[15][$session.ee_agree$]'] = 'null';
                    filters['$or[15][$session.ee_sign_success$]'] = 'null';
                    filters['$or[15][$session.ee_offer_success$]'] = 'true';
                    filters['$or[15][$session.gaz_agree$]'] = 'null';
                    filters['$or[15][$session.gaz_sign_success$]'] = 'null';
                    filters['$or[15][$session.gaz_offer_success$]'] = 'null';
                    filters['$or[16][$session.type$]'] = 'COMBO';
                    filters['$or[16][$session.ee_agree$]'] = 'null';
                    filters['$or[16][$session.ee_sign_success$]'] = 'null';
                    filters['$or[16][$session.ee_offer_success$]'] = 'null';
                    filters['$or[16][$session.gaz_agree$]'] = 'null';
                    filters['$or[16][$session.gaz_sign_success$]'] = 'null';
                    filters['$or[16][$session.gaz_offer_success$]'] = 'true';
                    filters['$or[17][$session.type$]'] = 'COMBO';
                    filters['$or[17][$session.ee_agree$]'] = 'null';
                    filters['$or[17][$session.ee_sign_success$]'] = 'null';
                    filters['$or[17][$session.ee_offer_success$]'] = 'true';
                    filters['$or[17][$session.gaz_agree$]'] = 'null';
                    filters['$or[17][$session.gaz_sign_success$]'] = 'null';
                    filters['$or[17][$session.gaz_offer_success$]'] = 'true';

                    filters['$or[9][$session.type$]'] = 'null';
                    break;
                default:
                    break;
            }
            delete filters.status;
        }

        if (filters.leadStatus) {
            filters.status = filters.leadStatus;
            delete filters.leadStatus;
        }

        if (filters.leadSubstatus) {
            filters.substatus = filters.leadSubstatus;
            delete filters.leadSubstatus;
        }

        return `&${queryString.stringify(filters, { encode: false })}`;
    }

    buildDateFilters({ start, end }, column) {
        if (start && end) {
            return `&${column}[$gte]=${moment(start)
                .startOf('day')
                .format('YYYYMMDD')}&${column}[$lt]=${moment(end)
                .startOf('day')
                .format('YYYYMMDD')}`;
        }
        return '';
    }

    buildSearchFilters(value) {
        if (value) {
            return `&$search=${value}`;
        }
        return '';
    }
}

export default new FiltersService();
