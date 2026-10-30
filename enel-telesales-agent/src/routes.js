import App from './App';
import pageService from 'services/page';

import Login from 'pages/Login';
import SessionList from 'pages/SessionList';
import SessionDetails from 'pages/SessionDetails';
import LeadsList from 'pages/LeadsList';
import LeadDetails from 'pages/LeadDetails';
import SearchPlace from 'pages/SearchPlace';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import SendOffer from './pages/SendOffer';
import SearchData from './pages/SearchData';
const childRoutes = [
    { path: pageService.links.login, component: Login },
    { path: pageService.links.searchPlace, component: SearchPlace },
    { path: pageService.links.searchData, component: SearchData },
    { path: pageService.links.resetPassword, component: ResetPassword },
    { path: pageService.links.sessionList, component: SessionList },
    { path: pageService.links.sessionDetails, component: SessionDetails },
    { path: pageService.links.sessionEdit, component: SessionDetails },
    { path: pageService.links.leadsList, component: LeadsList },
    { path: pageService.links.sendOffer, component: SendOffer },
    { path: pageService.links.leadDetails, component: LeadDetails },
    { path: '*', component: SessionList },
];

export default {
    path: '/',
    component: App,
    indexRoute: { component: SessionList },
    childRoutes,
};
