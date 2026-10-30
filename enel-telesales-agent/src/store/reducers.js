import auth from './auth/reducer';
import streets from './streets/reducer';
import cities from './cities/reducer';
import counties from './counties/reducer';
import documents from './documents/reducer';
import exceptions from './exceptions/reducer';
import leadLogs from './leadLogs/reducer';
import leads from './leads/reducer';
import offers from './offers/reducer';
import client from './client/reducer';
import session from './session/reducer';
import providers from './providers/reducer';
import distributors from './distributors/reducer';
import streetTypes from './streetTypes/reducer';
import campaigns from './campaigns/reducer';
import discounts from './discounts/reducer';
import banks from './banks/reducer';
import users from './users/reducer';
import offer from './offer/reducer';
import ui from './ui/reducer';
import companies from './companies/reducer';
import measurementIndexes from './measurementIndexes/reducer';
import reminders from './reminders/reducer';
import leadImportTemplates from './leadImportTemplate/reducer';
import place from './posf/reducer';
import salesforce from './search-data/reducer';
import voucher from './voucher/reducer';

export default {
    auth,
    banks,
    campaigns,
    discounts,
    cities,
    client,
    companies,
    counties,
    distributors,
    documents,
    exceptions,
    leadLogs,
    leads,
    leadImportTemplates,
    measurementIndexes,
    reminders,
    offers,
    providers,
    session,
    streets,
    streetTypes,
    ui,
    users,
    offer,
    place,
    voucher,
    salesforce,
};
