import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './HeaderHero.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
};

const defaultProps = {
    backgroundColor: '#000000',
};

class HeaderHero extends Component {
    state = {
        showSmallTitle: false,
    };

    handleScroll = _.throttle(e => {
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
                <div
                    className="FixedBg"
                    style={{ backgroundColor: '#000000' }}
                >
                    <div
                        className={`small-title ${
                            this.state.showSmallTitle ? 'show' : ''
                        }`}
                    >
                        {this.props.title}
                    </div>
                </div>
                <div className="HeaderHeroLogo">
                    <img src="/imgs/PPC_logo_negative.svg" alt="" />
                </div>
                <header
                    className="HeaderHero"
                    style={{ backgroundColor: '#000000' }}
                    ref={c => {
                        this.hero = c;
                    }}
                >
                    <div className="content">
                        <h1 className="title">
                            <span>{this.props.title}</span>
                        </h1>
                    </div>
                </header>
            </Fragment>
        );
    }
}

HeaderHero.propTypes = propTypes;
HeaderHero.defaultProps = defaultProps;

export default HeaderHero;
