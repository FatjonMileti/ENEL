import React from 'react';
import { connect } from 'react-redux';
import Swiper from '../swiper.jsx';

import Page from './page.jsx';
import Sidebar from './sidebar.jsx';

import toastr from 'toastr';

class Alerts extends React.Component {
    componentDidMount() {
        toastr.info('Not implemented');
    }
    render() {
        return ([
            <Page key={0} />,
            <Sidebar key={1} />]);
    }
}

export default connect(state => {
    return {
        router: state.router
    };
})(Alerts);