import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import api from '../../api/index.js';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import Table from './page.jsx';
import moment from 'moment';

class VariantePrets extends React.Component {



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
            if (!this.props.variantePret.isLoading && this.props.variantePret.total > this.props.variantePret?.data?.length) {
                this.props.loadMore();
            }
        }
    }

    componentDidMount() {
        this.props.isSyncing();
        this.props.initVariantePrets();
        setTimeout(function(){
            location.reload();
        }, 1000*60*3);
    }

    componentDidUpdate(prevProps) {
        
        if (!this.props.startDate.isSame(prevProps.startDate) || !this.props.endDate.isSame(prevProps.endDate))
            this.props.initVariantePrets();

        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.props.initVariantePrets();
                break;
            }
        }

    }

    async handleEditItem(e, data) {
        await this.props.updateItem(this.state.item.id, data);
        this.setState({
            update: false,
            item: null,
        })
        await this.props.initVariantePrets();
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
            <div className="content1" key={0}
                ref={this.listInnerRef}>
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>VARIANTE PRET - CACHE</h3>
                        <h6> Ultima sincronizare: {this.props.variantePret.data.length > 0 ? moment(this.props.variantePret.data[this.props.variantePret.data.length-1].updatedAt).format('DD/MM/YYYY hh:mm') : ''}</h6>
                        <a
                            onClick={this.props.runManualSync}
                            className={"button black right " + (this.props.isSyncingProcess ? 'disabled': '')}
                            href="#"
                            title="">
                            {/* <i className="icon-wlc-collection"></i> */}
                            {this.props.isSyncingProcess ? 'SINCRONIZAREA ESTE IN CURS...' : 'Start Manual Sync'}
                        </a>
                    </div>
                    <div className="content-box-body content-box-body-whitelist" >
                        <div className="scrollbar" onScroll={this.onScroll}>

                            <Table
                                variantePrets={this.props.variantePret}
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
        // variantePrets: state.variantePrets,
        router: state.router,
        variantePret: state.variantePretCache,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters,
        isLoading: state.ui.filters,
        isSyncingProcess: state.variantePretCache.syncing
    };
}, dispatch => {
    return {
        initVariantePrets: () => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'VARIANTE_PRET/VARIANTE_PRET_LOADING' });
                const state = getState();
                let result = await api.variantePret.all(50,
                   0,
                    state.variantePretCache.sortColumn,
                    state.variantePretCache.ascending);
                dispatch({ type: 'VARIANTE_PRET/ALL', payload: result });
            });
        },
        isSyncing: () => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'VARIANTE_PRET/VARIANTE_PRET_LOADING' });
                const state = getState();
                let result = await api.variantePret.isSyncing();
                dispatch({ type: 'VARIANTE_PRET/VARIANTE_PRET_SYNC', payload: result });
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'VARIANTE_PRET/VARIANTE_PRET_LOADING' });
                const state = getState();
                let result = await api.variantePret.all(50,
                    state.variantePretCache.currentIndex ? (state.variantePretCache.currentIndex !== 1 ? state.variantePretCache.currentIndex : 0) : 0,
                    state.variantePretCache.sortColumn,
                    state.variantePretCache.ascending);
                dispatch({ type: 'VARIANTE_PRET/APPEND', payload: result });
            });
        },
        runManualSync: () => {
            dispatch(async (dispatch, getState) => {
                api.variantePret.runSyncMannual();
                setTimeout(()=> {
                    window.location.reload();
                }, 1000);
            });
        }
    };
})(VariantePrets);
