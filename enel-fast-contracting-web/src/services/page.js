import _ from 'lodash';
import animateScrollTo from 'animated-scroll-to';

class PageService {
    links = {
        home: '',
        'restore-session': 'reia-procesul',
        plans: 'alege-oferta',
        offer: 'oferta',
        agreement: 'acord-preluare-si-procesare-date',
        'service-info': 'contractul-tau-de-furnizare',
        'client-info-scan': 'datele-tale-de-identificare',
        'cnp-validation': 'confirmare-cnp',
        'client-info-found': 'alege-setul-de-date',
        'client-info-new': 'completeaza-datele',
        'client-invoice-scan': 'datele-locului-de-consum',
        'nlc-validation': 'validare-loc-de-consum',
        'client-place-info': 'detalii-loc-de-consum',
        'client-place-docs': 'documentele-locului-de-consum',
        'contract-options': 'optiuni-contractuale',
        'marketing-options': 'optiuni-de-comunicare',
        'contract-review': 'documentele-sunt-gata',
        'thank-you': 'multumim',
        backoffice: 'procesare-contract',
    };

    steps = [
        { path: '', step: 1 },
        { path: this.links['restore-session'], step: 1 },
        { path: this.links.offer, step: 1 },
        { path: this.links.plans, step: 2 },
        { path: this.links.agreement, step: 3 },
        { path: this.links['service-info'], step: 4 },
        { path: this.links['client-info-scan'], step: 5 },
        { path: this.links['cnp-validation'], step: 6 },
        { path: this.links['client-info-found'], step: 7 },
        { path: this.links['client-info-new'], step: 7 },
        { path: this.links['client-invoice-scan'], step: 8 },
        { path: this.links['nlc-validation'], step: 9 },
        { path: this.links['client-place-info'], step: 10 },
        { path: this.links['client-place-docs'], step: 11 },
        { path: this.links['contract-options'], step: 12 },
        { path: this.links['marketing-options'], step: 13 },
        { path: this.links['contract-review'], step: 14 },
        { path: this.links.backoffice, step: 14 },
        { path: this.links['thank-you'], step: 14 },
    ];

    actions = {
        SELECTARE_OFERTA: { value: 'SELECTARE_OFERTA', page: this.links.plans },
        ACORD_FURNIZARE_DATE: { value: 'ACORD_FURNIZARE_DATE', page: this.links.agreement },
        INFORMATII_FURNIZARE: { value: 'INFORMATII_FURNIZARE', page: this.links['service-info'] },
        FOTOGRAFIERE_BULETIN: { value: 'FOTOGRAFIERE_BULETIN', page: this.links['client-info-scan'] },
        VALIDARE_CNP: { value: 'VALIDARE_CNP', page: this.links['cnp-validation'] },
        IDENTIFICARE_CLIENT: { value: 'IDENTIFICARE_CLIENT', page: this.links['client-info-found'] },
        FOTO_FACTURA: { value: 'FOTO_FACTURA', page: this.links['client-invoice-scan'] },
        VALIDARE_LOC_CONSUM: { value: 'VALIDARE_LOC_CONSUM', page: this.links['nlc-validation'] },
        IDENTIFICARE_LOC_CONSUM: { value: 'IDENTIFICARE_LOC_CONSUM', page: this.links['client-place-info'] },
        FOTO_ACT_SPATIU: { value: 'FOTO_ACT_SPATIU', page: this.links['client-place-docs'] },
        ADAUGARE_ACT_SPATIU: { value: 'ADAUGARE_ACT_SPATIU', page: this.links['client-place-docs'] },
        OPTIUNI_CONTRACTE_FURNIZARE: { value: 'OPTIUNI_CONTRACTE_FURNIZARE', page: this.links['contract-options'] },
        OPTIUNI_COMUNICARE: { value: 'OPTIUNI_COMUNICARE', page: this.links['marketing-options'] },
        GENERARE_DOCUMENTE: { value: 'GENERARE_DOCUMENTE', page: this.links['marketing-options'] },
        REVIEW_DOCUMENTE: { value: 'REVIEW_DOCUMENTE', page: this.links['contract-review'] },
        CONTRACTE_REFUZATE: { value: 'CONTRACTE_REFUZATE', page: this.links['contract-review'] },
        CONTRACTE_ACCEPTATE: { value: 'CONTRACTE_ACCEPTATE', page: this.links['contract-review'] },
        CONTRACTE_PRINTALL: { value: 'CONTRACTE_PRINTALL', page: this.links['contract-review'] },
    };

    scrollTo(element, options = {}) {
        animateScrollTo(element, Object.assign({ offset: -120 }, options));
    }

    scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    scrollToError = () => {
        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            const error =
                document.querySelector('.general-errors') ||
                document.querySelector('.has-error');
            if (error) animateScrollTo(error, { offset: -120 });
        }, 100);
    };

    getStepFromPage = (route) => {
        const path = _.find(this.steps, step => step.path == route);
        return path ? path.step : 10000;
    };

    getPageFromStep = number =>
        _.find(this.steps, step => step.step == number).path || '';

    isMobile() {
        return window.innerWidth < 576;
    }
}

export default new PageService();
