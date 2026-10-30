import React from 'react';
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import store, { history } from './store.js';
import Layout from './components/layout.jsx';
import { BrowserRouter , Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// ReactDOM.render(
//     <Provider store={store}>
//         <ConnectedRouter history={history}>
//             <Layout />
//         </ConnectedRouter>
//     </Provider>, document.getElementById('app')
// );

const root = createRoot(document.getElementById("app"));
root.render(
    <Provider store={store}>
        {/* <ReduxRouter history={history}> */}
        <BrowserRouter basename='/cms-v2'>
            <Layout />
        </BrowserRouter>
        {/* </ReduxRouter> */}
    </Provider>
);