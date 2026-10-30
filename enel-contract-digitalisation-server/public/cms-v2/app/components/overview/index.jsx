import React from 'react';
import { connect } from 'react-redux';
import Swiper from '../swiper.jsx';

import OverviewPage from './page.jsx';
import SidebarContainerOverview from './sidebarContainerOverview.jsx';

import toastr from 'toastr';

class Overview extends React.Component {
    componentDidMount() {
    }
    render() {
        return ([
            <OverviewPage navigate={this.props.navigate} key={0} />,
            <SidebarContainerOverview key={1} />
        ]);
    }
}

export default connect(state => {
    return {
        router: state.router
    };
})(Overview);