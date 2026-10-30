import pageService from 'services/page';

export const getStepIdByPathname = (pathname) => {
    switch (pathname) {
    case pageService.links['agreement']:
        return 'genericDossierContracting';
    case pageService.links['service-info']:
    case pageService.links['client-info-scan']:
    case pageService.links['cnp-validation']:
    case pageService.links['client-info-found']:
    case pageService.links['client-info-new']:
        return 'dossierContractType';
    case pageService.links['client-invoice-scan']:
        return 'dossierClientIdentification';
    case pageService.links['nlc-validation']:
        return 'dossierTracePodNlc';
    case pageService.links['client-place-info']:
        return 'dossierConsuptions';
    default:
        return 'dossierConsuptions';
    }
};

export const getSessionFlowData = (session, flow) => session[`${flow.toLocaleLowerCase()}_serviciu`];
