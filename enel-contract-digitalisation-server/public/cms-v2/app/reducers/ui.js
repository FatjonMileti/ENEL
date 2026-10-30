import moment from 'moment';
import toastr from 'toastr';

let initialState = {
    sidebarShow: false,
    settingsShow: false,
    calendarShow: false,
    filterShow: false,
    isLoading: false,
    preserveFilters: false,

    filterValues: {
        channels: [{ value: 2, label: 'Partener' }, { value: 3, label: 'Punct PPC' }, { value: 5, label: 'Infokiosk' }, { value: 6, label: 'Fast Contract' }, { value: 4, label: 'Call Center' }],
        workingRegions: [],
        clientCategories: [{label: 'Casnic', value: 'b2c'}, {label: 'Noncasnic', value: 'b2b'}],
        counties: [],
        companies: [],
        agents: [],
        products: [{ label: 'Electricitate', value: 'EE' }, { label: 'Gaz', value: 'GAZ' }, { label: 'Combo', value: 'COMBO' }],
        statuses: [{ label: 'Activated', value: 'ACTIVATED' }, { label: 'Rejected', value: 'REJECTED' }, { label: 'Pending for activation', value: 'PENDING' }, { label: 'Unfinished', value: 'UNFINISHED' }, { label: 'Error', value: 'ERRORED' }, {label: 'BO Unprocessed', value: 'BO_UNPROCESSED'}],
        pages: [
            { label: 'INITIAL', value: 'INITIAL' },
            { label: 'SELECTARE_OFERTA', value: 'SELECTARE_OFERTA' },
            { label: 'ACORD_FURNIZARE_DATE', value: 'ACORD_FURNIZARE_DATE' },
            { label: 'INFORMATII_FURNIZARE', value: 'INFORMATII_FURNIZARE' },
            { label: 'FOTOGRAFIERE_BULETIN', value: 'FOTOGRAFIERE_BULETIN' },
            { label: 'VALIDARE_CNP', value: 'VALIDARE_CNP' },
            { label: 'IDENTIFICARE_CLIENT', value: 'IDENTIFICARE_CLIENT' },
            { label: 'FOTO_FACTURA', value: 'FOTO_FACTURA' },
            { label: 'VALIDARE_LOC_CONSUM', value: 'VALIDARE_LOC_CONSUM' },
            { label: 'IDENTIFICARE_LOC_CONSUM', value: 'IDENTIFICARE_LOC_CONSUM' },
            { label: 'FOTO_ACT_SPATIU', value: 'FOTO_ACT_SPATIU' },
            { label: 'ADAUGARE_ACT_SPATIU', value: 'ADAUGARE_ACT_SPATIU' },
            { label: 'OPTIUNI_CONTRACTE_FURNIZARE', value: 'OPTIUNI_CONTRACTE_FURNIZARE' },
            { label: 'OPTIUNI_COMUNICARE', value: 'OPTIUNI_COMUNICARE' },
            { label: 'GENERARE_DOCUMENTE', value: 'GENERARE_DOCUMENTE' },
            { label: 'SEMNARE_AGENT', value: 'SEMNARE_AGENT' },
            { label: 'REVIEW_DOCUMENTE', value: 'REVIEW_DOCUMENTE' },
            { label: 'CONTRACTE_REFUZATE', value: 'CONTRACTE_REFUZATE' },
            { label: 'CONTRACTE_ACCEPTATE', value: 'CONTRACTE_ACCEPTATE' },
            { label: 'CONTRACTE_PRINTALL', value: 'CONTRACTE_PRINTALL' },
            { label: 'CONTRACTE_TRIMISE_SMS', value: 'CONTRACTE_TRIMISE_SMS' },
            { label: 'CONTRACTE_TRIMISE_EMAIL', value: 'CONTRACTE_TRIMISE_EMAIL' },
            { label: 'CONTRACTE_SEMNATE_FIZIC', value: 'CONTRACTE_SEMNATE_FIZIC' },
            { label: 'ACCESARE_LINK', value: 'ACCESARE_LINK' },
            { label: 'ACTIVARE_ACCEPT', value: 'ACTIVARE_ACCEPT' },
            { label: 'ACTIVARE_REFUZ', value: 'ACTIVARE_REFUZ' }],
        abandonTypes: [
            { label: 'MO-Clientul nu este de acord cu politica de prelucrare date personale', value: 'REFUZ_ACORD_PRELUCRARE_DATE' },
            { label: 'MO-Clientul nu are actele necesare', value: 'LIPSA_DOCUMENTE' },
            { label: 'MO-Clientul nu doreste sa finalizeze contractul', value: 'ABANDON_CLIENT' },
            { label: 'MO-Eroare din aplicatie', value: 'EROARE' },
            { label: 'MO-Alte motive', value: 'ALTELE' },
            { label: 'FC-Abandon client', value: 'FC_ABANDON_BROWSER_INCHIS' },
            { label: 'Sesiuni expirate', value: 'AUTOMATIC_EXPIRE' },
            { label: 'Refuz client dupa ofertare', value: 'ACTIVARE_REFUZ' },
            { label: 'Refuz agent', value: 'AGENT_REJECT' },
        ],
        saleTypes: [{ label: 'Shop', value: 1 }, { label: 'D2D', value: 0 }, { label: 'Telesales', value: 2 }, { label: 'Low Investment', value: 3 }]
    },
    filters: {
        channels: '',
        workingRegions: '',
        counties: '',
        companies: '',
        agents: '',
        marca: '',
        products: '',
        statuses: '',
        pages: '',
        abandonTypes: '',
        clientCategory: '',
        saleType: '',
        pod:'',
        cnp:'',
        sid:'',
        cpn:'',   //client phone number
        cle:'',   //client email
        conpn:'', //contract phone number
        conem:''  //contract email
    },

    startDate: Object.freeze(moment().add(-2, 'month').startOf('month')),
    endDate: Object.freeze(moment().startOf('day'))
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_FILTERS':
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload
                }
            };
        case 'INIT_FILTER_VALUES':
            return {
                ...state,
                filterValues: {
                    ...state.filterValues,
                    ...action.payload
                }
            };
        case 'TOGGLE_FILTER':
            return {
                ...state,
                filterShow: !state.filterShow
            }
        case 'PRESERVE_FILTERS':
            return {
                ...state,
                preserveFilters: true
            }
        case 'SET_DATES':
            return {
                ...state,
                startDate: action.payload.startDate,
                endDate: action.payload.endDate
            };
        case 'TOGGLE_CALENDAR':
            return {
                ...state,
                calendarShow: !state.calendarShow
            }
        case 'HIDE_CALENDAR':
            return {
                ...state,
                calendarShow: false
            }
        case 'TOGGLE_SIDEBAR':
            return {
                ...state,
                sidebarShow: !state.sidebarShow
            }
        case 'TOGGLE_SETTINGS':
            return {
                ...state,
                settingsShow: !state.settingsShow
            }

        case 'START_LOADING':
        case 'D2D/SESSION_LOADING':
        case 'WEB/SESSION_LOADING':
        case 'OCR_LOADING':
        case 'AGENTS_LOADING':
        case 'D2D/LOGS_LOADING':
        case 'D2D/ERR_LOADING':
        case 'AGENT/SESSION_LOADING':
            return {
                ...state,
                isLoading: true
            };
        case 'END_LOADING':
        case 'D2D/INIT_SESSIONS':
        case 'WEB/INIT_SESSIONS':
        case 'D2D/APPEND_SESSIONS':
        case 'WEB/APPEND_SESSIONS':
        case 'INIT_OCR':
        case 'INIT_AGENTS':
        case 'APPEND_AGENTS':
        case 'D2D/LOGS_APPEND':
        case 'D2D/ERR_APPEND':
        case 'AGENT/APPEND_SESSIONS':
        case 'AGENT_INIT':
            return {
                ...state,
                isLoading: false
            };
        case '@@router/LOCATION_CHANGE':
            toastr.clear();
            const newState = {
                ...state,
                sidebarShow: false,
                settingsShow: false,
                calendarShow: false,
                filterShow: false,
                preserveFilters: false,
            }

            if (!state.preserveFilters) {
                newState['filters'] = {
                    ...initialState.filters
                }
            }

            return newState;
        default:
            return state;
    }
};

export default reducer;
