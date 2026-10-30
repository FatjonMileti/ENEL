import App from './App';
import pageService from 'services/page';

import PlanOptions from 'scenes/PlanOptions/PlanOptions';
import PlanList from 'scenes/PlanList/PlanList';
import Agreement from 'scenes/Agreement/Agreement';
import ServiceInfo from 'scenes/ServiceInfo/ServiceInfo';
import ClientInfoScan from 'scenes/ClientInfoScan/ClientInfoScan';
import CNPValidation from 'scenes/CNPValidation/CNPValidation';
import ClientInfoFound from 'scenes/ClientInfoSelection/ClientInfoFound';
import ClientInfoNew from 'scenes/ClientInfoSelection/ClientInfoNew';
import ClientInvoiceScan from 'scenes/ClientInvoiceScan/ClientInvoiceScan';
import NLCValidation from 'scenes/NLCValidation/NLCValidation';
import ClientPlaceInfo from 'scenes/ClientPlaceInfo/ClientPlaceInfo';
import ClientPlaceDocs from 'scenes/ClientPlaceDocs/ClientPlaceDocs';
import ContractOptions from 'scenes/ContractOptions/ContractOptions';
import MarketingOptions from 'scenes/MarketingOptions/MarketingOptions';
import ContractReview from 'scenes/ContractReview/ContractReview';
import ThankYou from 'scenes/ThankYou/ThankYou';
import Backoffice from 'scenes/Backoffice/Backoffice';
import RestoreSession from 'hooks/RestoreSession/RestoreSession';
import OfferSelection from 'hooks/OfferSelection/OfferSelection';

const childRoutes = [
    // { path: pageService.links['offer'], component: OfferSelection },
    { path: pageService.links['plans'], component: PlanList },
    { path: pageService.links['restore-session'], component: RestoreSession },
    { path: pageService.links['agreement'], component: Agreement },
    { path: pageService.links['service-info'], component: ServiceInfo },
    { path: pageService.links['client-info-scan'], component: ClientInfoScan },
    { path: pageService.links['cnp-validation'], component: CNPValidation },
    { path: pageService.links['client-info-found'], component: ClientInfoFound },
    { path: pageService.links['client-info-new'], component: ClientInfoNew },
    { path: pageService.links['client-invoice-scan'], component: ClientInvoiceScan },
    { path: pageService.links['nlc-validation'], component: NLCValidation },
    { path: pageService.links['client-place-info'], component: ClientPlaceInfo },
    { path: pageService.links['client-place-docs'], component: ClientPlaceDocs },
    { path: pageService.links['contract-options'], component: ContractOptions },
    { path: pageService.links['marketing-options'], component: MarketingOptions },
    { path: pageService.links['contract-review'], component: ContractReview },
    { path: pageService.links['thank-you'], component: ThankYou },
    { path: pageService.links['backoffice'], component: Backoffice },
    { path: pageService.links['offer'], component: PlanOptions },
    { path: '*', component: PlanOptions },
];

export default {
    path: '/',
    component: App,
    indexRoute: { component: PlanOptions },
    childRoutes,
};
