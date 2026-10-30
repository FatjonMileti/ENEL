import moment from 'moment';
import toastr from 'toastr';

let initialState = {
    sidebarShow: false,
    settingsShow: false,
    calendarShow: false,
    filterShow: false,
    isLoading: false,

    filterValues: {
        channels: [{ value: 2, label: 'Partener' }, { value: 3, label: 'Punct PPC' }, { value: 4, label: 'Call Center' }, { value: 5, label: 'Infokiosk' }], //{ value: 6, label: 'Web' }
        workingRegions: [],
        counties: [],
        companies: [],
        agents: [],
        products: [{ label: 'Electricitate', value: 'EE' }, { label: 'Gaz', value: 'GAZ' }, { label: 'Combo', value: 'COMBO' }],
        statuses: [{ label: 'Activated', value: 'ACTIVATED' }, { label: 'Rejected', value: 'REJECTED' }, { label: 'Pending for activation', value: 'PENDING' }, { label: 'Unfinished', value: 'UNFINISHED' }, { label: 'Error', value: 'ERRORED' }],
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
            { label: 'Clientul nu este de acord cu politica de prelucrare date personale', value: 'REFUZ_ACORD_PRELUCRARE_DATE' },
            { label: 'Clientul nu are actele necesare', value: 'LIPSA_DOCUMENTE' },
            { label: 'Clientul nu doreste sa finalizeze contractul', value: 'ABANDON_CLIENT' },
            { label: 'Eroare din aplicatie', value: 'EROARE' },
            { label: 'Alte motive', value: 'ALTELE' },
        ],
        saleTypes: [{ label: 'Shop', value: '0' }, { label: 'D2D', value: '1' }, { label: 'Telesales', value: '2' }, { label: 'Low Investment', value: '3' }]
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
        saleType: ''
    },

    startDate: moment().add(-2, 'month').startOf('month'),
    endDate: moment().startOf('day')
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
            return {
                ...state,
                sidebarShow: false,
                settingsShow: false,
                calendarShow: false,
                filterShow: false,
                filters: {
                    ...initialState.filters
                }
            };
        default:
            return state;
    }
};

export default reducer;