import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';

import OverviewLists from './components/overviewLists';   
import OverviewStatsContainer from './components/overviewStatsContainer';   

class OverviewPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        return (
            <div className="content">
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Overview</h3>
                    </div>
                    <div className="content-box-body">
                        <div className="scrollbar">
                            <OverviewStatsContainer />  
                            <OverviewLists navigate={this.props.navigate} /> 
                            <div className="box-action">
                                <a onClick={this.props.export_onclick} className="button black" href="#" title=""><i className="icon-wlc-download-arrow"></i>Download Report</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
        export_onclick: (e) => {
            e.preventDefault();
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forSession(state);

                let url = `${window.location.origin}/cms/proxy/excel?&$sort[createdAt]=-1`;
                for (const filter of filters)
                    url += `&${filter.column}=${filter.value}`;
                window.open(url);
            });
        },
    };
})(OverviewPage);