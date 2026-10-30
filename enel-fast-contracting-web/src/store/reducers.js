import { reducer as formReducer } from 'redux-form';
import exceptions from './exceptions/reducer';
import counties from './counties/reducer';
import cities from './cities/reducer';
import streets from './streets/reducer';
import streetTypes from './streetTypes/reducer';
import offers from './offers/reducer';
import ocr from './ocr/reducer';
import session from './session/reducer';
import providers from './providers/reducer';
import distributors from './distributors/reducer';
import client from './client/reducer';
import documents from './documents/reducer';
import banks from './banks/reducer';
import invoiceExamples from './invoiceExamples/reducer';
import ui from './ui/reducer';
import campaigns from './campaigns/reducer';
import discounts from './discounts/reducer';
import registration from './registration/reducer';
import voucher from './voucher/reducer';

export default {
    form: formReducer,
    exceptions,
    counties,
    cities,
    streets,
    streetTypes,
    offers,
    ocr,
    session,
    providers,
    distributors,
    client,
    documents,
    banks,
    invoiceExamples,
    ui,
    campaigns,
    discounts,
    registration,
    voucher
};
