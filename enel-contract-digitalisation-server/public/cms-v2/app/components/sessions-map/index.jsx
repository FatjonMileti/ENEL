import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import SidebarContainerOverview from '../overview/sidebarContainerOverview';
import SessionsGoogleMap from './components/sessionsGoogleMap';

class SessionsMap extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return [
        <div className="content" key={0}>
            <div className="content-box content-box-with-tabs">
                <div className="content-box-header">
                    <h3>Sessions Map</h3>
                </div>
                <div className="content-box-body sessions-map-container">
                    <SessionsGoogleMap />
                </div>
            </div>
        </div>,
        <SidebarContainerOverview key={1} />]
    }
}

export default connect(state => {

}, dispatch => {

})(SessionsMap);
