import React from 'react';
import { connect } from 'react-redux';
import DateRangePicker from './daterangepicker.jsx';

import { history } from '../store.js';

import toastr from 'toastr';
import { isMoment } from 'moment';
import api from '../api/index.js';
import _ from 'lodash';

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            channels: '',
            workingRegions: '',
            counties: '',
            companies: '',
            agents: '',
            marca: '',
            pages: '',
            abandonTypes: '',
            products: '',
            statuses: '',
            saleType: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.apply_onclick = this.apply_onclick.bind(this);
        this.clear_onclick = this.clear_onclick.bind(this);
        this.search_change = this.search_change.bind(this);
    }

    componentDidMount() {
        this.props.initFilters();
    }
    // if filters change in reducer update the ui
    componentDidUpdate(prevProps) {
        for (const key in this.props.filters) {
            if (this.props.filters[key] !== prevProps.filters[key]) {
                this.setState({
                    ...this.props.filters
                });
                break;
            }
        }
    }

    getCalendarInput() {
        return this.props.hasFilter ? <p key={1} onClick={this.props.toggleCalendar} className={`hc-btn trigger-calendar${this.props.calendarShow ? ' selected' : ''}`}><i className="icon-wlc-calendar-2"></i>{this.props.startDate.format('DD.MM.YYYY')} - {moment(this.props.endDate).add(-1, 'day').format('DD.MM.YYYY')}</p> : null;
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (name === 'channels' && value !== '2') {
            this.setState({
                [name]: value,
                saleType: ''
            });
        }
        else {
            this.setState({
                [name]: value
            });
        }
    }

    apply_onclick() {
        this.props.filter(this.state);
        this.props.toggleFilter();
    }

    clear_onclick() {
        this.setState({
            channels: '',
            workingRegions: '',
            counties: '',
            companies: '',
            agents: '',
            marca: '',
            products: '',
            pages: '',
            abandonTypes: '',
            statuses: '',
            saleType: ''
        }, () => {
            this.props.filter(this.state);
            this.props.toggleFilter();
        });
    }

    search_change(e) {
        let value = e.target.value;
        let agent = this.props.agents.find(x => `${x.label}` == value);
        if (agent) {
            history.push(`/easyofficers/${agent.value}`);
            e.target.value = '';
        }
    }

    render() {
        const path = this.props.router.location.pathname;
        const isD2D = path === '/doortodoor' || path === '/applogs';
        const isWeb = path === '/fastcontract';
        const isAgent = path.indexOf('/easyofficers') !== -1;
        return (
            <div className="header-content">
                <div className="header-content-logo"><img src="/cms-v2/img/ppc-white.svg" alt="ppc" /></div>
                {
                    this.props.isAdmin ? [
                        <form key={0} className="search" onSubmit={(e) => { e.preventDefault(); }}>
                            <fieldset>
                                <input type="text" onChange={this.search_change} name="" list="ddlAgentAutocomplete" placeholder="Search Agent" />
                                <datalist id="ddlAgentAutocomplete">
                                    {
                                        _.sortBy(this.props.agents, 'label').map((x, i) => {
                                            return (
                                                <option key={i} value={`${x.label}`}>{x.marca}</option>
                                            );
                                        })
                                    }
                                </datalist>
                                <button><i className="icon-wlc-search"></i></button>
                            </fieldset>
                        </form>,
                        this.getCalendarInput(),
                        this.props.hasFilter ? <p key={2} onClick={this.props.toggleFilter} className={`hc-btn trigger-filters${this.props.filterShow ? ' selected' : ''}`}><i className="icon-wlc-filters"></i>Apply filters</p> : null
                    ] : [
                            this.getCalendarInput(),
                            this.props.hasFilter ? <p key={2} onClick={this.props.toggleFilter} className={`hc-btn trigger-filters${this.props.filterShow ? ' selected' : ''}`}><i className="icon-wlc-filters"></i>Apply filters</p> : null
                        ]
                }
                {
                    this.props.user ?
                        <p className="hc-btn trigger-profile-menu"><span>{(this.props.user.firstName || 'admin').substring(0, 1).toUpperCase()}{(this.props.user.lastName || 'admin').substring(0, 1).toUpperCase()}</span></p>
                        : null
                }
                <div className={`mainfilters transition-3s-in-out`}>
                    <DateRangePicker isOpen={this.props.calendarShow}
                        onChange={this.props.setDates}
                        onClose={this.props.hideCalendar}
                        startDate={this.props.startDate}
                        endDate={this.props.endDate} />
                </div>
                <div className={`mainfilters transition-3s-in-out${this.props.filterShow ? ' opened' : ''}`}>
                    <form className="clearfix">
                        <div className="w50s left">
                            <h3><i className="icon-wlc-filters"></i>Filter by source</h3>
                            {
                                !isD2D ? null :
                                    <div className="form-group select">
                                        <select onChange={this.handleInputChange} value={this.state.channels} name="channels" className="form-control">
                                            <option value="">Any</option>
                                            {
                                                this.props.channels.map((x, i) => {
                                                    return (
                                                        <option key={i} value={x.value}>{x.label}</option>
                                                    );
                                                })
                                            }
                                        </select>
                                        <label className="control-label">Channels</label>
                                    </div>
                            }
                            {
                                this.state.channels !== '2' ? null :
                                    <div className="form-group select">
                                        <select onChange={this.handleInputChange} value={this.state.saleType} name="saleType" className="form-control">
                                            <option value="">Any</option>
                                            {
                                                this.props.saleTypes.map((x, i) => {
                                                    return (
                                                        <option key={i} value={x.value}>{x.label}</option>
                                                    );
                                                })
                                            }
                                        </select>
                                        <label className="control-label">Sale Type</label>
                                    </div>
                            }
                            {
                                this.props.isAdmin || this.props.isAuditor ? <div className="form-group select">
                                    <select onChange={this.handleInputChange} value={this.state.companies} name="companies" className="form-control">
                                        <option value="">Any</option>
                                        {
                                            _.sortBy(this.props.companies, 'label').map((x, i) => {
                                                return (
                                                    <option key={i} value={x.value}>{x.label}</option>
                                                );
                                            })
                                        }
                                    </select>
                                    <label className="control-label">Company/Shop</label>
                                </div> : null
                            }
                            <div className="form-group select">
                                <select onChange={this.handleInputChange} value={this.state.pages} name="pages" className="form-control">
                                    <option value="">Any</option>
                                    {
                                        this.props.pages.map((x, i) => {
                                            return (
                                                <option key={i} value={x.value}>{x.label}</option>
                                            );
                                        })
                                    }
                                </select>
                                <label className="control-label">Last Page</label>
                            </div>
                            {
                                !isD2D ? null :
                                    <div className="form-group select">
                                        <select onChange={this.handleInputChange} value={this.state.abandonTypes} name="abandonTypes" className="form-control">
                                            <option value="">Any</option>
                                            {
                                                this.props.abandonTypes.map((x, i) => {
                                                    return (
                                                        <option key={i} value={x.value}>{x.label}</option>
                                                    );
                                                })
                                            }
                                        </select>
                                        <label className="control-label">Cancel Reason</label>
                                    </div>
                            }
                        </div>
                        <div className="w50s right">
                            <h3><i className="icon-wlc-filters"></i>Filter by allocation</h3>
                            {
                                !isD2D ? null :
                                    <div className="form-group select">
                                        <select onChange={this.handleInputChange} value={this.state.marca} name="marca" className="form-control">
                                            <option value="">Any</option>
                                            {
                                                _.sortBy(this.props.agents, 'marca').map((x, i) => {
                                                    return (
                                                        <option key={i} value={x.marca}>{x.marca}</option>
                                                    );
                                                })
                                            }
                                        </select>
                                        <label className="control-label">Marca</label>
                                    </div>
                            }
                            {
                                !isD2D ? null :
                                    <div className="form-group select">
                                        <select onChange={this.handleInputChange} value={this.state.agents} name="agents" className="form-control">
                                            <option value="">Any</option>
                                            {
                                                _.sortBy(this.props.agents, 'label').map((x, i) => {
                                                    return (
                                                        <option key={i} value={x.value}>{x.label}</option>
                                                    );
                                                })
                                            }
                                        </select>
                                        <label className="control-label">Agent</label>
                                    </div>
                            }
                            <div className="form-group select">
                                <select onChange={this.handleInputChange} value={this.state.products} name="products" className="form-control">
                                    <option value="">Any</option>
                                    {
                                        this.props.products.map((x, i) => {
                                            return (
                                                <option key={i} value={x.value}>{x.label}</option>
                                            );
                                        })
                                    }
                                </select>
                                <label className="control-label">Product</label>
                            </div>
                            <div className="form-group select">
                                <select onChange={this.handleInputChange} value={this.state.statuses} name="statuses" className="form-control">
                                    <option value="">Any</option>
                                    {
                                        this.props.statuses.map((x, i) => {
                                            return (
                                                <option key={i} value={x.value}>{x.label}</option>
                                            );
                                        })
                                    }
                                </select>
                                <label className="control-label">Contract Status</label>
                            </div>
                        </div>
                    </form>
                    <div className="btn-panel">
                        <button onClick={this.apply_onclick} className="ui-priority-primary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">
                            <span className="ui-button-text">Apply</span>
                        </button>
                        <button onClick={this.clear_onclick} className="ui-priority-secondary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">
                            <span className="ui-button-text">Clear</span>
                        </button>
                        <button onClick={this.props.toggleFilter} className="ui-priority-secondary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only">
                            <span className="ui-button-text">Cancel</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user.info,
        isAdmin: state.user.isAdmin,
        isManager: state.user.isManager,
        isAuditor: state.user.isAuditor,
        calendarShow: state.ui.calendarShow,
        filterShow: state.ui.filterShow,

        startDate: state.ui.startDate,
        endDate: state.ui.endDate,

        filters: state.ui.filters,

        channels: state.ui.filterValues.channels,
        workingRegions: state.ui.filterValues.workingRegions,
        counties: state.ui.filterValues.counties,
        companies: state.ui.filterValues.companies,
        agents: state.ui.filterValues.agents,
        products: state.ui.filterValues.products,
        pages: state.ui.filterValues.pages,
        abandonTypes: state.ui.filterValues.abandonTypes,
        statuses: state.ui.filterValues.statuses,
        saleTypes: state.ui.filterValues.saleTypes
    };
}, dispatch => {
    return {
        initFilters: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();

                const allUserPersonalData = await api.user.allPersonalData();

                let workingRegions = [...new Set(allUserPersonalData
                    .map(x => x.workingRegion)
                    .filter(x => !!x)
                )].map(x => ({
                    label: x,
                    value: x
                })),
                    counties = [...new Set(allUserPersonalData
                        .map(x => x.county)
                        .filter(x => !!x)
                    )].map(x => ({
                        label: x,
                        value: x
                    })),
                    companies = (await api.canal.all()).data.map(x => {
                        return {
                            label: x.denumire,
                            value: x.internal_id
                        };
                    }),
                    agents = allUserPersonalData.map(x => ({
                        label: `${x.firstName} ${x.lastName}`,
                        marca: x.marca,
                        value: x.id
                    }));

                dispatch({
                    type: 'INIT_FILTER_VALUES',
                    payload: {
                        workingRegions,
                        counties,
                        companies,
                        agents
                    }
                });
            });
        },
        filter(filters) {
            dispatch({ type: 'SET_FILTERS', payload: filters });
        },
        toggleCalendar: () => {
            dispatch((dispatch, getState) => {
                const filterShow = getState().ui.filterShow;
                if (filterShow)
                    dispatch({ type: 'TOGGLE_FILTER' });
                return dispatch({ type: 'TOGGLE_CALENDAR' });
            });
        },
        hideCalendar: () => {
            return dispatch({ type: 'HIDE_CALENDAR' });
        },
        toggleFilter: () => {
            dispatch((dispatch, getState) => {
                const calendarShow = getState().ui.calendarShow;
                if (calendarShow)
                    dispatch({ type: 'HIDE_CALENDAR' });
                return dispatch({ type: 'TOGGLE_FILTER' });
            });
        },
        setDates: (start, end) => {
            return dispatch({ type: 'SET_DATES', payload: { startDate: start, endDate: end } })
        }
    };
})(Header);