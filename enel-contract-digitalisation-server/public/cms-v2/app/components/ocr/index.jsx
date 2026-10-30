import React from 'react';
import { connect } from 'react-redux';
import Swiper from '../swiper.jsx';

import OCRPage from './page.jsx';
import Sidebar from './sidebar.jsx';

import toastr from 'toastr';

class OCR extends React.Component {
    componentDidMount() {
    }
    render() {
        return ([
            <OCRPage key={0} />,
            <Sidebar key={1} />]);
    }
}

export default connect(state => {
    return {
        router: state.router
    };
})(OCR);