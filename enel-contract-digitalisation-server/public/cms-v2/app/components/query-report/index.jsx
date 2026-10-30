import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import api from '../../api/index.js';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import Table from './page.jsx';
import InfiniteScroll from '../infiniteScroll.jsx';
import SidebarContainerOverview from '../overview/sidebarContainerOverview.jsx';

class QueryReporter extends React.Component {



    constructor(props) {
        super(props);
        this.state =
        {
            update: false,
            item: null,
        };
        this.listInnerRef = React.createRef();
        autoBind(this);
    }
    onScroll() {
        if (this.listInnerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = this.listInnerRef.current;
            if (scrollTop + clientHeight === scrollHeight && !this.props.queryReporter.isLoading && this.props.queryReporter.total > this.props.report.data.length) {
                this.props.loadMore();
            }
        }
    }

    componentDidMount() {
        this.props.initWhitelist();
    }

    componentDidUpdate(prevProps) {
        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.initWhitelist();

        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.initWhitelist();
                break;
            }
        }
        // if (this.props.report && (prevProps.report.total != this.props.report.total))
        //     this.props.initWhitelist();

    }

    async handleEditItem(e, data) {
        await this.props.updateItem(this.state.item.id, data);
        this.setState({
            update: false,
            item: null,
        })
        await this.props.initWhitelist();
    }

    async onEditItem(item) {
        this.setState((prevState) => ({ ...prevState, item }));
        this.setState({ update: true });
    }

    async onDismiss(e) {
        this.setState({
            update: false,
            item: null,
        })
    }

    render() {
        return (
            <div className="content content1" key={0} onScroll={this.onScroll}
                ref={this.listInnerRef}>
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Query Report</h3>
                        <a
                            onClick={this.props.export_onclick}
                            className="button black right"
                            href="#"
                            title="">
                            <i className="icon-wlc-download-arrow"></i>
                            Download Report
                        </a>
                    </div>
                    <div className="content-box-body content-box-body-whitelist">
                        <div className="scrollbar">

                            <Table
                                whitelist={this.props.report}
                            />

                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export default connect(state => {
    return {
        report: state.queryReporter,
        router: state.router,
        queryReporter: state.queryReporter,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters
    };
}, dispatch => {
    return {
        initWhitelist: () => {

            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'REPORT/REPORT_LOADING' });
                const state = getState();
                const filters = buildFiltersFromState.forQueryReport(state);
                let result = await api.queryReporter.all(50,
                   0,
                    state.queryReporter.sortColumn,
                    state.queryReporter.ascending,
                    filters);
                dispatch({ type: 'REPORT/ALL', payload: result });
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'REPORT/REPORT_LOADING' });
                const state = getState();
                const filters = buildFiltersFromState.forQueryReport(state);
                let result = await api.queryReporter.all(50,
                    state.queryReporter.currentIndex ? (state.queryReporter.currentIndex !== 1 ? state.queryReporter.currentIndex : 0) : 0,
                    state.queryReporter.sortColumn,
                    state.queryReporter.ascending,
                    filters);
                dispatch({ type: 'REPORT/APPEND', payload: result });
            });
        },
        export_onclick: (e) => {
            e.preventDefault();
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const filters = buildFiltersFromState.forQueryReport(state);

                let url = `${window.location.origin}/cms/proxy/excel-query-report?$sort[createdAt]=-1`;
                for (const filter of filters)
                    url += `&${filter.column}=${filter.value}`;
                window.open(url);
            });
        },
    };
})(QueryReporter);