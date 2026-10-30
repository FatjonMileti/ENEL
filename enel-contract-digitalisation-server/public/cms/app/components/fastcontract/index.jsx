import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import Swiper from '../swiper.jsx';

import Contracts from './page.jsx';
import Security from '../partials/security.jsx';
import Errors from '../partials/errors.jsx';
import Sidebar from './sidebar.jsx';

import toastr from 'toastr';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';

class FastContract extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0
        };
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
            <div className="content" key={0}>
                <div className="content-box content-box-with-tabs">
                    <div className="content-box-header">
                        <h3>PPC Fast Contract</h3>
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
                            {this.props.isAdmin || this.props.isAuditor ?
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
                            <span className={this.state.index === 0 ? 'selected' : ''} onClick={this.tab_onclick(0)}>Contracts</span>
                            { this.props.isAdmin || this.props.isAuditor ? <span className={this.state.index === 1 ? 'selected' : ''} onClick={this.tab_onclick(1)}>Security Logs</span> : null }
                            { this.props.isAdmin || this.props.isAuditor ? <span className={this.state.index === 2 ? 'selected' : ''} onClick={this.tab_onclick(2)}>Errors</span> : null }
                            { (this.props.isAdmin || this.props.isAuditor) &&
                                <a onClick={this.props.detailed_export_onclick} className="button blue right" href="#" title=""><i className="icon-wlc-download-arrow"></i>Download Detailed Report</a>
                            }
                        </div>
                    </div>
                </div>
            </div>,
            <Sidebar key={1} />]);
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user,
        isAdmin: state.user.isAdmin,
        isAuditor: state.user.isAuditor,
    };
}, dispatch => {
    return {
        detailed_export_onclick: (e) => {
            e.preventDefault();
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state);

                let url = `${window.location.origin}/cms/proxy/excel?client_app=${window.WEB_APP}&$sort[createdAt]=-1&$detailed=true`;
                for (const filter of filters)
                    url += `&${filter.column}=${filter.value}`;
                window.open(url);
            });
        },
    }
})(FastContract);