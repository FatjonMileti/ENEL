import React, { Component } from 'react';
import autoBind from 'react-autobind';

import { connect } from 'react-redux';

const propTypes = {

};

const defaultProps = {

};

class ThankYou extends Component {

    state = {

    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        document.body.className = 'bg-green multumim-13';
        window.location = 'https://www.ppcenergy.ro/confirmare/contract-rapid-confirmare-contract';
    }

    componentWillUnmount() {
        document.body.className = '';
    }

    render() {
        return (
            <div className="ThankYou"></div>
        );
    }
}

ThankYou.propTypes = propTypes;
ThankYou.defaultProps = defaultProps;

const mapStateToProps = state => ({

});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(ThankYou);
