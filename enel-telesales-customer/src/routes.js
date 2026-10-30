import App from './App';
import UploadDocs from 'pages/UploadDocs';

const childRoutes = [{ path: '*', component: UploadDocs }];

export default {
    path: '/',
    component: App,
    indexRoute: { component: UploadDocs },
    childRoutes,
};
