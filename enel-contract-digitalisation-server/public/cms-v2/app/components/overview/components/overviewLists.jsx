import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import moment from 'moment';
import _ from 'lodash';

import { history } from '../../../store.js';

import api from '../../../api/index.js';
import buildFiltersFromState from '../../../helpers/buildFiltersFromState.js';
import { 
    getStatusFilters,
    STARTED,
    ACTIVATED,
    PENDING,
    ERRORED,
} from '../../../helpers/filters.js';

class OverviewLists extends React.Component {

    state = {
        expanded: {
            d2d: false,
            shop: false,
            office: false,
            telesalesPartner:false,
            telesalesCallCenter:false,
            telesalesShop:false,
            loadedFirstTime: false
        }
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
     
        this.props.loadStats(() => {
            this.setState({loadedFirstTime: true})
        });
    }

    componentDidUpdate(prevProps) {
        if (
            this.state.loadedFirstTime && 
            (
                !this.props.startDate.isSame(prevProps.startDate) 
                || !this.props.endDate.isSame(prevProps.endDate) 
                || Object.keys(this.props.filters).find(key => this.props.filters[key] !== prevProps.filters[key])
            )
        ) {
            this.props.loadStats();
        }
    }

    getChannels(type) {
        return _.filter(this.props.channels, company => {
            return this.getStatsByCompany(company.internal_id, type, 'started') !== '-';
        });
    }

    getExpandedHeight(type) {
        let height = 33 * (_.size(this.getChannels(type)));
        if (this.hasUnknown(type)) height += 33;
        return height;
    }

    getStats(channel, value) {
        if (this.props.byChannel && this.props.byChannel[channel]) {
            return this.props.byChannel[channel][value];
        }

        return 0;
    }

    getStatsByCompany(channelId, type, value) {
        if (this.props.byCompany && this.props.byCompany[type]) {
            const stats = this.props.byCompany[type];
            const result = _.find(stats[value], item => item.companyId == channelId);
            if (result) return result.count;
        }

        return '-';
    }

    toggleExpand(type) {
        const expanded = _.extend(this.state.expanded, {});
        expanded[type] = !this.state.expanded[type];
        this.setState({ expanded })
    }

    setFilters(type, status, companyId) {
        let filters = _.clone(this.props.filters);

        if (status) filters.statuses = status;
        if (companyId) filters.companies = companyId;

        if (type == 'd2d') {
            filters.channels = '2';
            filters.saleType = '0';
        } else if (type == 'shop') {
            filters.channels = '2';
            filters.saleType = '1';
        } else if (type == 'telesalesPartner') {
            filters.channels = '2';
            filters.saleType = '2';
        } else if (type == 'telesalesCallCenter') {
            filters.channels = '4';
        } else if (type == 'telesalesShop') {
            filters.channels = '3';
            //filter.saleType = '2';
        } else if (type == 'office') {
            filters.channels = '3';
           // filter.saleType = '0';
        } else if (type == 'web') {
            filters.channels = '6';
        }

        this.props.setFilters(filters);
        this.props.preserveFilters();
        return this.props.navigate('/sessions');
    }

    hasUnknown(type) {
        const count = this.props.unknown[type];
        return count && count.started;
    }

    renderCompanies(type) {
        const companies = _.sortBy(this.getChannels(type), channel => {
            return (-1) * parseInt(this.getStatsByCompany(channel.internal_id, type, 'started'))
        });
        return _.map(companies, company => (
            <ul className="expanded-list" key={company.internal_id}>
                <li onClick={() => this.setFilters(type, null, company.internal_id)}><strong>{company.denumire}</strong></li>
                <li onClick={() => this.setFilters(type, null, company.internal_id)}><strong>{this.getStatsByCompany(company.internal_id, type, 'started')}</strong></li>
                <li onClick={() => this.setFilters(type, ACTIVATED, company.internal_id)}><strong>{this.getStatsByCompany(company.internal_id, type, 'activated')}</strong></li>
                <li onClick={() => this.setFilters(type, PENDING, company.internal_id)}><strong>{this.getStatsByCompany(company.internal_id, type, 'pending')}</strong></li>
                <li onClick={() => this.setFilters(type, ERRORED, company.internal_id)}><strong>{this.getStatsByCompany(company.internal_id, type, 'errored')}</strong></li>
            </ul>
        ))
    }

    renderUnknownCompany(type) {
        if (this.hasUnknown(type)) {
            const count = this.props.unknown[type];
            return (
                <ul className="expanded-list">
                    <li><strong>Unknown</strong></li>
                    <li><strong>{count.started || '-'}</strong></li>
                    <li><strong>{count.activated || '-'}</strong></li>
                    <li><strong>{count.pending || '-'}</strong></li>
                    <li><strong>{count.errored || '-'}</strong></li>
                </ul>
            );
        }
    }

    render() {
        return (
            <div className="box mar0b OverviewLists">
                <ul className="table-ul overview-list">
                    <li className="table-ul-header">
                        <ul>
                            <li><strong>Channel</strong></li>
                            <li><strong>Contracts</strong></li>
                            <li><strong>Approved for activation</strong></li>
                            <li><strong>Pending Approval</strong></li>
                            <li><strong>Canceled or with error</strong></li>
                        </ul>
                    </li>
                    <li>
                        <ul className="expand-table-row">
                            <li onClick={() => this.setFilters('d2d')}><strong>D2D Partner</strong></li>
                            <li onClick={() => this.setFilters('d2d')}><strong>{this.getStats('d2d', 'started')}</strong></li>
                            <li onClick={() => this.setFilters('d2d', ACTIVATED)}><strong>{this.getStats('d2d', 'activated')}</strong></li>
                            <li onClick={() => this.setFilters('d2d', PENDING)}><strong>{this.getStats('d2d', 'pending')}</strong></li>
                            <li onClick={() => this.setFilters('d2d', ERRORED)}><strong>{this.getStats('d2d', 'errored')}</strong></li>
                        </ul>
                        <i
                            className={`square-btn-light expand-table-row ${this.state.expanded.d2d ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}`}
                            onClick={() => this.toggleExpand('d2d')}
                        />
                        <div className="table-row-detailes" style={{ height: this.state.expanded.d2d ? `${this.getExpandedHeight('d2d')}px` : 0 }}>
                            {this.renderCompanies('d2d')}
                            {this.renderUnknownCompany('d2d')}
                        </div>
                    </li>
                    <li>
                        <ul className="expand-table-row">
                            <li onClick={() => this.setFilters('shop')}><strong>Shop Partner</strong></li>
                            <li onClick={() => this.setFilters('shop')}><strong>{this.getStats('shop', 'started')}</strong></li>
                            <li onClick={() => this.setFilters('shop', ACTIVATED)}><strong>{this.getStats('shop', 'activated')}</strong></li>
                            <li onClick={() => this.setFilters('shop', PENDING)}><strong>{this.getStats('shop', 'pending')}</strong></li>
                            <li onClick={() => this.setFilters('shop', ERRORED)}><strong>{this.getStats('shop', 'errored')}</strong></li>
                        </ul>
                        <i
                            className={`square-btn-light expand-table-row ${this.state.expanded.shop ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}`}
                            onClick={() => this.toggleExpand('shop')}
                        />
                        <div className="table-row-detailes" style={{ height: this.state.expanded.shop ? `${this.getExpandedHeight('shop')}px` : 0 }}>
                            {this.renderCompanies('shop')}
                            {this.renderUnknownCompany('shop')}
                        </div>
                    </li>
                    <li>
                        <ul className="expand-table-row">
                            <li onClick={() => this.setFilters('office')}><strong>Offices</strong></li>
                            <li onClick={() => this.setFilters('office')}><strong>{this.getStats('office', 'started')}</strong></li>
                            <li onClick={() => this.setFilters('office', ACTIVATED)}><strong>{this.getStats('office', 'activated')}</strong></li>
                            <li onClick={() => this.setFilters('office', PENDING)}><strong>{this.getStats('office', 'pending')}</strong></li>
                            <li onClick={() => this.setFilters('office', ERRORED)}><strong>{this.getStats('office', 'errored')}</strong></li>
                        </ul>
                        <i
                            className={`square-btn-light expand-table-row ${this.state.expanded.office ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}`}
                            onClick={() => this.toggleExpand('office')}
                        />
                        <div className="table-row-detailes" style={{ height: this.state.expanded.office ? `${this.getExpandedHeight('office')}px` : 0 }}>
                            {this.renderCompanies('office')}
                            {this.renderUnknownCompany('office')}
                        </div>
                    </li>
                    <li>
                        <ul className="expand-table-row">
                            <li onClick={() => this.setFilters('web')}><strong>Fast Contract</strong></li>
                            <li onClick={() => this.setFilters('web')}><strong>{this.getStats('web', 'started')}</strong></li>
                            <li onClick={() => this.setFilters('web', ACTIVATED)}><strong>{this.getStats('web', 'activated')}</strong></li>
                            <li onClick={() => this.setFilters('web', PENDING)}><strong>{this.getStats('web', 'pending')}</strong></li>
                            <li onClick={() => this.setFilters('web', ERRORED)}><strong>{this.getStats('web', 'errored')}</strong></li>
                        </ul>
                    </li> 
                    <li>
                        <ul className="expand-table-row">
                            <li onClick={() => this.setFilters('telesalesPartner')}><strong>Telesales Partner</strong></li>
                            <li onClick={() => this.setFilters('telesalesPartner')}><strong>{this.getStats('telesalesPartner', 'started')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesPartner', ACTIVATED)}><strong>{this.getStats('telesalesPartner', 'activated')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesPartner', PENDING)}><strong>{this.getStats('telesalesPartner', 'pending')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesPartner', ERRORED)}><strong>{this.getStats('telesalesPartner', 'errored')}</strong></li>
                        </ul>
                        <i
                            className={`square-btn-light expand-table-row ${this.state.expanded.telesalesPartner ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}`}
                            onClick={() => this.toggleExpand('telesalesPartner')}
                        />
                        <div className="table-row-detailes" style={{ height: this.state.expanded.telesalesPartner ? `${this.getExpandedHeight('telesalesPartner')}px` : 0 }}>
                            {this.renderCompanies('telesalesPartner')}
                            {this.renderUnknownCompany('telesalesPartner')}
                        </div>
                    </li>  
                    <li>
                        <ul className="expand-table-row">
                            <li onClick={() => this.setFilters('telesalesCallCenter')}><strong>Call Center</strong></li>
                            <li onClick={() => this.setFilters('telesalesCallCenter')}><strong>{this.getStats('telesalesCallCenter', 'started')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesCallCenter', ACTIVATED)}><strong>{this.getStats('telesalesCallCenter', 'activated')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesCallCenter', PENDING)}><strong>{this.getStats('telesalesCallCenter', 'pending')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesCallCenter', ERRORED)}><strong>{this.getStats('telesalesCallCenter', 'errored')}</strong></li>
                        </ul>
                        <i
                            className={`square-btn-light expand-table-row ${this.state.expanded.telesalesCallCenter ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}`}
                            onClick={() => this.toggleExpand('telesalesCallCenter')}
                        />
                        <div className="table-row-detailes" style={{ height: this.state.expanded.telesalesCallCenter ? `${this.getExpandedHeight('telesalesCallCenter')}px` : 0 }}>
                            {this.renderCompanies('telesalesCallCenter')}
                            {this.renderUnknownCompany('telesalesCallCenter')}
                        </div>
                    </li>   
                    <li>
                        <ul className="expand-table-row">
                            <li onClick={() => this.setFilters('telesalesShop')}><strong>Telesales Shop</strong></li>
                            <li onClick={() => this.setFilters('telesalesShop')}><strong>{this.getStats('telesalesShop', 'started')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesShop', ACTIVATED)}><strong>{this.getStats('telesalesShop', 'activated')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesShop', PENDING)}><strong>{this.getStats('telesalesShop', 'pending')}</strong></li>
                            <li onClick={() => this.setFilters('telesalesShop', ERRORED)}><strong>{this.getStats('telesalesShop', 'errored')}</strong></li>
                        </ul>
                        <i
                            className={`square-btn-light expand-table-row ${this.state.expanded.telesalesShop ? 'icon-wlc-arrow-up' : 'icon-wlc-arrow-down'}`}
                            onClick={() => this.toggleExpand('telesalesShop')}
                        />
                        <div className="table-row-detailes" style={{ height: this.state.expanded.telesalesShop ? `${this.getExpandedHeight('telesalesShop')}px` : 0 }}>
                            {this.renderCompanies('telesalesShop')}
                            {this.renderUnknownCompany('telesalesShop')}
                        </div>
                    </li>                                   
                </ul>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        byCompany: state.session.count.byCompany,
        byChannel: state.session.count.byChannel,
        unknown: state.session.count.unknown,
        channels: state.channel.data,
        startDate: state.ui.startDate,
        endDate: state.ui.endDate,
        filters: state.ui.filters,
    };
}, dispatch => {
    return {
        loadStats: (finishedLoadingCallback = f=>f) => {
            dispatch(async (dispatch, getState) => {
                const state = getState();
                const channels = await api.canal.all();
                const filters = buildFiltersFromState.forSession(state).filter(item => {
                    return !['$agent.type$', '$agent.employed$', 'client_app'].includes(item.column);
                });
                dispatch({ type: 'CHANNEL/ALL', payload: channels });

                const types = {
                    d2d: [
                        { column: '$and[15][$agent.type$]', value: 'vi' },
                        { column: '$and[15][$agent.employed$]', value: 'false' },
                        { column: 'client_app', value: window.ANDROID_APP1 },
                    ],
                    shop: [
                        { column: '$and[15][$agent.type$]', value: 'vi' },
                        { column: '$and[15][$agent.employed$]', value: 'true' },
                        { column: 'client_app', value: window.ANDROID_APP1 },
                    ],
                    office: [
                        { column: '$and[15][$agent.type$]', value: 'pe' },
                        { column: 'client_app', value: window.ANDROID_APP1 },
                    ],
                    web: [
                        { column: 'client_app', value: window.WEB_APP },
                    ],
                    telesalesPartner: [
                        { column: '$and[15][$agent.type$]', value: 'vi' },
                        { column: 'client_app', value: window.TELESALES_AGENT_APP },
                    ],
                    telesalesCallCenter: [
                        { column: '$and[15][$agent.type$]', value: 'cc' },
                        { column: 'client_app', value: window.TELESALES_AGENT_APP },
                    ],
                    telesalesShop: [
                        { column: '$and[15][$agent.type$]', value: 'pe' },
                        { column: 'client_app', value: window.TELESALES_AGENT_APP },
                    ]
                }

                const agentType = buildFiltersFromState.forSession(state).find(item => item.column == '$and[15][$agent.type$]');
                const agentEmployeed = buildFiltersFromState.forSession(state).find(item => item.column == '$and[15][$agent.employed$]');
                const clientApp = buildFiltersFromState.forSession(state).find(item => item.column == 'client_app');
                
                // rules to force other stats to 0
                // by sending a wrong value which is 'unknown'
                if (agentType) {
                    if (agentType.value == 'vi') {
                        types.office[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.web[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesCallCenter[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesShop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };

                        if (agentEmployeed) {
                            if (agentEmployeed.value == 'true') {
                                types.d2d[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                                types.telesalesPartner[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                            } else {
                                types.shop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                                types.telesalesPartner[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                            }
                        } else if (clientApp && clientApp.value == window.TELESALES_AGENT_APP) {
                            types.d2d[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                            types.shop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        }
                    } else if (agentType.value == 'pe'){
                        types.d2d[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.shop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.web[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesCallCenter[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesPartner[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        
                        if (agentEmployeed){ 
                            if (agentEmployeed.value == 'true') 
                                types.telesalesShop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                            else if (clientApp && (clientApp.value == window.TELESALES_AGENT_APP))
                                types.office[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        }
                    }
                    else if (agentType.value == 'ik') {
                        types.d2d[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.shop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.office[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.web[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesPartner[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesCallCenter[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesShop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                    }
                    else if (agentType.value == 'cc') {
                        types.d2d[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.shop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.office[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.web[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesPartner[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                        types.telesalesShop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                    }
                }

                if (clientApp && clientApp.value == window.WEB_APP) {
                    types.d2d[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                    types.shop[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                    types.office[0] = { column: '$and[15][$agent.type$]', value: 'unknown' };
                }

                let result = await Promise.all([
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), types.d2d)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), types.d2d)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(PENDING), types.d2d)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ERRORED), types.d2d)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), types.shop)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), types.shop)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(PENDING), types.shop)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ERRORED), types.shop)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), types.office)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), types.office)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(PENDING), types.office)),
                    api.session.count(window.ANDROID_APP1, filters.concat(getStatusFilters(ERRORED), types.office)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(STARTED), types.web)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(ACTIVATED), types.web)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(PENDING), types.web)),
                    api.session.count(window.WEB_APP, filters.concat(getStatusFilters(ERRORED), types.web)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(STARTED), types.telesalesPartner)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ACTIVATED), types.telesalesPartner)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(PENDING), types.telesalesPartner)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ERRORED), types.telesalesPartner)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(STARTED), types.telesalesCallCenter)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ACTIVATED), types.telesalesCallCenter)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(PENDING), types.telesalesCallCenter)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ERRORED), types.telesalesCallCenter)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(STARTED), types.telesalesShop)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ACTIVATED), types.telesalesShop)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(PENDING), types.telesalesShop)),
                    api.session.count(window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ERRORED), types.telesalesShop)),
                ]);

                const byChannel = {
                    d2d: {
                        started: result[0],
                        activated: result[1],
                        pending: result[2],
                        errored: result[3],
                    },
                    shop: {
                        started: result[4],
                        activated: result[5],
                        pending: result[6],
                        errored: result[7],
                    },
                    office: {
                        started: result[8],
                        activated: result[9],
                        pending: result[10],
                        errored: result[11],
                    },
                    web: {
                        started: result[12],
                        activated: result[13],
                        pending: result[14],
                        errored: result[15],
                    },
                    telesalesPartner: {
                        started: result[16],
                        activated: result[17],
                        pending: result[18],
                        errored: result[19],
                    },
                    telesalesCallCenter: {
                        started: result[20],
                        activated: result[21],
                        pending: result[22],
                        errored: result[23],
                    },
                    telesalesShop: {
                        started: result[24],
                        activated: result[25],
                        pending: result[26],
                        errored: result[27],
                    },
                }
                dispatch({ type: 'SESSION/COUNT/CHANNEL', payload: byChannel });

                result = await Promise.all([
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), types.d2d)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), types.d2d)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(PENDING), types.d2d)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(ERRORED), types.d2d)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), types.shop)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), types.shop)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(PENDING), types.shop)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(ERRORED), types.shop)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(STARTED), types.office)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(ACTIVATED), types.office)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(PENDING), types.office)),
                    api.session.countGrouped('agent.companyId', window.ANDROID_APP1, filters.concat(getStatusFilters(ERRORED), types.office)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(STARTED), types.telesalesPartner)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ACTIVATED), types.telesalesPartner)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(PENDING), types.telesalesPartner)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ERRORED), types.telesalesPartner)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(STARTED), types.telesalesCallCenter)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ACTIVATED), types.telesalesCallCenter)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(PENDING), types.telesalesCallCenter)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ERRORED), types.telesalesCallCenter)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(STARTED), types.telesalesShop)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ACTIVATED), types.telesalesShop)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(PENDING), types.telesalesShop)),
                    api.session.countGrouped('agent.companyId', window.TELESALES_AGENT_APP, filters.concat(getStatusFilters(ERRORED), types.telesalesShop)),
                ]);

                const byCompany = {
                    d2d: {
                        started: result[0],
                        activated: result[1],
                        pending: result[2],
                        errored: result[3],
                    },
                    shop: {
                        started: result[4],
                        activated: result[5],
                        pending: result[6],
                        errored: result[7],
                    },
                    office: {
                        started: result[8],
                        activated: result[9],
                        pending: result[10],
                        errored: result[11],
                    },
                    telesalesPartner: {
                        started: result[12],
                        activated: result[13],
                        pending: result[14],
                        errored: result[15],
                    },
                    telesalesCallCenter: {
                        started: result[16],
                        activated: result[17],
                        pending: result[18],
                        errored: result[19],
                    },
                    telesalesShop: {
                        started: result[20],
                        activated: result[21],
                        pending: result[22],
                        errored: result[23],
                    },
                }
                dispatch({ type: 'SESSION/COUNT/COMPANY', payload: byCompany });

                const filterKnown = item => {
                    if (!item.companyId) return false;
                    return channels.data.map(c => (c.internal_id || '').toString()).includes(item.companyId.toString())
                };
                const countUnknown = (type, status) => {
                    const known = byCompany[type][status].filter(filterKnown);
                    let count = 0;
                    known.forEach(item => count += parseInt(item.count));
                    return parseInt(byChannel[type][status]) - count;
                }
                const unknown = {
                    d2d: {
                        started: countUnknown('d2d', 'started'),
                        activated: countUnknown('d2d', 'activated'),
                        pending: countUnknown('d2d', 'pending'),
                        errored: countUnknown('d2d', 'errored'),
                    },
                    shop: {
                        started: countUnknown('shop', 'started'),
                        activated: countUnknown('shop', 'activated'),
                        pending: countUnknown('shop', 'pending'),
                        errored: countUnknown('shop', 'errored'),
                    },
                    office: {
                        started: countUnknown('office', 'started'),
                        activated: countUnknown('office', 'activated'),
                        pending: countUnknown('office', 'pending'),
                        errored: countUnknown('office', 'errored'),
                    },
                    telesalesPartner: {
                        started: countUnknown('telesalesPartner', 'started'),
                        activated: countUnknown('telesalesPartner', 'activated'),
                        pending: countUnknown('telesalesPartner', 'pending'),
                        errored: countUnknown('telesalesPartner', 'errored'),
                    },
                    telesalesCallCenter: {
                        started: countUnknown('telesalesCallCenter', 'started'),
                        activated: countUnknown('telesalesCallCenter', 'activated'),
                        pending: countUnknown('telesalesCallCenter', 'pending'),
                        errored: countUnknown('telesalesCallCenter', 'errored'),
                    },
                    telesalesShop: {
                        started: countUnknown('telesalesShop', 'started'),
                        activated: countUnknown('telesalesShop', 'activated'),
                        pending: countUnknown('telesalesShop', 'pending'),
                        errored: countUnknown('telesalesShop', 'errored'),
                    },
                }
                dispatch({ type: 'SESSION/COUNT/UNKNOWN', payload: unknown });

                finishedLoadingCallback()
            });
        },
        setFilters(filters) {
            dispatch({ type: 'SET_FILTERS', payload: filters });
        },
        preserveFilters(filters) {
            dispatch({ type: 'PRESERVE_FILTERS' });
        },
    };
})(OverviewLists);
