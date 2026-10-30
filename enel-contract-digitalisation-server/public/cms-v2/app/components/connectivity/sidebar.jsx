import React from 'react';
import { connect } from 'react-redux';

import api from '../../api/location.js';
import LocationsMap from './components/locationsMap';

class Sidebar extends React.Component {
    componentDidMount() {
        this.props.initLocations();
    }

    render() {
        return (
            <div className="flex-sidebar">
                <div className="flex-sidebar-header">
                    <h3>Locations Map</h3>
                </div>
                <div className="connectivity-status-map">
                    <LocationsMap
                        locations={{}}
                    />
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user
    };
}, dispatch => {
    return {
        initLocations: () => {
            
        }
    };
})(Sidebar);