import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import Swiper from '../swiper.jsx';

import Contracts from './page.jsx';
import Security from '../partials/security.jsx';
import Errors from '../partials/errors.jsx';

import toastr from 'toastr';

class AppLog extends React.Component {
    state = {
        index: 0
    };

    constructor(props) {
        super(props);
        this.swiper = null;
        this.tab_onclick = this.tab_onclick.bind(this);
    }

    tab_onclick(index) {
        return () => {
            if (!this.swiper)
                return;

            this.setState({
                index: index
            });
            this.swiper.slideTo(index);
        };
    }

    render() {
        return ([
            <div className="content full-width" key={0}>
                <div className="content-box content-box-with-tabs">
                    <div className="content-box-header">
                        <h3>Application Logs</h3>
                    </div>
                    <div className="content-box-body">

                        <Swiper {...{
                            containerClass: 'content-box-body-slider',
                            slidesPerView: 1,
                            spaceBetween: 0,
                            keyboardControl: true,
                            onInit: swiper => {
                                window.swiper = swiper;
                                this.swiper = swiper;
                            },
                            onSlideChangeStart: (swiper) => {
                                this.setState({ index: swiper.activeIndex });
                            }
                        }}>
                            {this.props.isAdmin ?
                                <Fragment>
                                    <Contracts />
                                    <Security contract={'WEB'} />
                                    <Errors contract={'WEB'} />
                                </Fragment>
                                :
                                <Contracts />
                            }
                        </Swiper>

                        <div className="tabs">
                            <span className={this.state.index === 0 ? 'selected' : ''} onClick={this.tab_onclick(0)}>ERRORS</span>
                            {/* <span onClick={() => toastr.info('Not implemented!')}>Statistics for Partners</span> */}
                            {/* <span className={this.state.index === 1 ? 'selected' : ''} onClick={this.tab_onclick(1)}>Security Logs</span>
                            <span className={this.state.index === 2 ? 'selected' : ''} onClick={this.tab_onclick(2)}>Errors</span> */}
                        </div>
                    </div>
                </div>
            </div>]);
    }
}

export default connect(state => {
    return {
        router: state.router2
    };
})(AppLog);