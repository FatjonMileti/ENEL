import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ProgressBar from 'components/ProgressBar';
import RegistrationInfo from './RegistrationInfo';

import './HeaderHero.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    background: PropTypes.string,
    showRegistrationInfo: PropTypes.bool,
};

const defaultProps = {
    background: 'url(svg/header_background.svg)',
    showRegistrationInfo: false,
};

class HeaderHero extends Component {

    state = {
        showSmallTitle: false,
    };

    handleScroll = _.throttle((e) => {
        if (this.hero) {
            const bounding = this.hero.getBoundingClientRect();
            const bottom = bounding.top + bounding.height;
            if (bottom < 0 && !this.state.showSmallTitle) {
                this.setState({ showSmallTitle: true });
            } else if (bottom > 0 && this.state.showSmallTitle) {
                this.setState({ showSmallTitle: false });
            }
        }
    }, 100);

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            window.addEventListener('scroll', this.handleScroll);
            this.handleScroll();
        }, 100);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        return (
            <Fragment>
                <div className="FixedBg" style={{ backgroundColor: 'black' }}>
                    <div className={`small-title ${this.state.showSmallTitle ? 'show' : ''}`}>
                        {this.props.title}
                    </div>
                </div>
                <ProgressBar />
                <div className="HeaderHeroLogo">
                    <a href="#">
                        <img src="imgs/PPC_logo_negative.svg" />
                    </a>
                </div>
                <header
                    className="HeaderHero"
                    ref={(c) => { this.hero = c; }}
                >
                    <div className="content">
                        <h1 className="title">
                            <span>{this.props.title}</span>
                            {this.props.showRegistrationInfo && <RegistrationInfo className="subtitle" />}
                        </h1>
                    </div>
                    <div className="blue-black-header" style={{ position: 'absolute', overflow: 'hidden', top: 0, width: '100%' }}>
                        <div className="row" style={{ display: 'inherit', flexWrap: 'unset' }}>
                            <div className="col-sm gradient-header gradient-header1"></div>
                            <div className="col-sm gradient-header gradient-header2"></div>
                            <div className="col-sm gradient-header gradient-header3"></div>
                            <div className="col-sm gradient-header gradient-header4"></div>
                            <div className="col-sm gradient-header gradient-header5"></div>
                            <div className="col-sm gradient-header gradient-header6"></div>
                            <div className="col-sm gradient-header gradient-header7"></div>
                            <div className="col-sm gradient-header gradient-header8"></div>
                            <div className="col-sm gradient-header gradient-header9"></div>
                            <div className="col-sm gradient-header gradient-header10"></div>
                            <div className="col-sm gradient-header gradient-header11"></div>
                        </div>
                    </div>
                </header>
            </Fragment>
        );
    }
}

HeaderHero.propTypes = propTypes;
HeaderHero.defaultProps = defaultProps;

export default HeaderHero;
