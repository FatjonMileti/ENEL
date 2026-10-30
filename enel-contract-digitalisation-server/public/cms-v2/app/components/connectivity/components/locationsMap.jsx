import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import GoogleMap from '@react-google-maps/api';
import ReactGoogleMapLoader from 'react-google-maps-loader';
import moment from 'moment';

// eslint-disable-next-line
const MAP_STYLE = [{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] }, { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] }, { "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#fefefe" }, { "lightness": 17 }, { "weight": 1.2 }] }];

const propTypes = {
    locations: PropTypes.array.isRequired,
};

class LocationsMap extends Component {

    state = {
        googleMaps: null,
        map: null,
        center: {},
        markers: null,
        locationsLoaded: false,
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.tryLoadLocations();
    }

    componentWillReceiveProps() {
        this.tryLoadLocations();
    }

    tryLoadLocations = () => {
        if (!this.state.googleMaps
            || !this.state.map
            || _.isEmpty(this.props.locations)
            || this.state.locationsLoaded
        ) { return }

        const { map, googleMaps } = this.state;

        const bounds = new googleMaps.LatLngBounds();
        const markers = this.props.locations.map((item) => {
            const latLng = new googleMaps.LatLng(item.lat, item.lon);
            const marker = new googleMaps.Marker({
                map,
                position: latLng,
                title: item.name,
                icon: `/cms-v2/img/pin-location-${item.status}.png`,
            });

            googleMaps.event.addListener(marker, 'click', () => {
                const infoWindow = this.getInfoWindow(googleMaps, item);
                infoWindow.open(map, marker);
            });

            bounds.extend(latLng);
            return { marker };
        });
        
        window.map = map;
        if (markers.length > 1) {
            map.fitBounds(bounds);
        }
        if (map.getZoom() > 16) {
            map.setZoom(16);
        }

        // Add a marker clusterer to manage the markers.
        const markerCluster = new MarkerClusterer(map, markers.map(item => item.marker), {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });

        this.setState({
            markers,
            locationsLoaded: true,
        });
    }

    handleMapLoaded = (googleMaps, map) => {
        this.setState({ googleMaps, map }, () => {
            this.tryLoadLocations();
        });
    }

    getInfoWindow = (googleMaps, location) => {
        const content = `
            <div class="gmap-tooltip">
                <h3>${location.name}</h3>
                <p>
                    Last Check: ${moment(location.lastPingAt).format('HH:mm DD.MM.YYYY')}<br/>
                    Last Access Time: ${location.lastDelayMs ? `${location.lastDelayMs} ms` : '-'}<br/>
                    Average Access Time This Week: ${location.averageDelayWeek ? `${location.averageDelayWeek} ms` : '-'}
                </p>
            </div>
        `;

        if (this.state.infoWindow) {
            const { infoWindow } = this.state;
            infoWindow.setContent(content);
            return infoWindow;
        }
        
        const infoWindow = new googleMaps.InfoWindow({
            content,
            maxWidth: 300,
        });

        this.setState({ infoWindow });
        return infoWindow;
    }

    render() {
        if (this.state.map && this.state.map.getZoom() > 16) {
            this.state.map.setZoom(16);
        }

        return (
            <ReactGoogleMapLoader
                params={{
                    libraries: 'places',
                    key: window.GOOGLE_MAP_KEY,
                }}
                render={(googleMaps) => {
                    return (
                        googleMaps && !_.isEmpty(this.props.locations) && <div id="map">
                            <GoogleMap
                                googleMaps={googleMaps}
                                center={{ lat: -34.397, lng: 150.644 }}
                                zoom={14}
                                onLoaded={this.handleMapLoaded}
                                styles={MAP_STYLE}
                            />
                        </div>
                    )
                }}
            />
        );
    }
}

LocationsMap.propTypes = propTypes;

export default connect((state) => {
    return {
        locations: state.location.data
    }
})(LocationsMap);