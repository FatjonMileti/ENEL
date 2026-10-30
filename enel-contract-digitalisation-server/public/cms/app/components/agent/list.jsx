import React from 'react';
import { connect } from 'react-redux';
import InfiniteScroll from '../infiniteScroll';
import moment from 'moment';
import api from '../../api';
import toastr from 'toastr';
import DropModal from 'reboron/DropModal';
// import downloader from '../../helpers/download';

class AgentList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedId: null,
            resetUserId: null
        };

        this.menu_onclick = this.menu_onclick.bind(this);
        this.block_onclick = this.block_onclick.bind(this);
        this.delete_onclick = this.delete_onclick.bind(this);
        this.open_onclick = this.open_onclick.bind(this);
    }

    componentDidMount() {
        this.props.initAgents();
        this.props.initCounters();
    }

    menu_onclick(id) {
        return e => {
            e.preventDefault();
            e.stopPropagation();

            if (id !== this.state.selectedId)
                this.setState({ selectedId: id });
            else
                this.setState({ selectedId: null });
        }
    }

    open_onclick(e, slug, withId = true) {
        e.preventDefault();
        this.props.history.push(`/${slug}/${withId ? this.state.selectedId : 'new'}`);
    }

    block_onclick(e) {
        e.preventDefault();
        toastr.info('Not implemented');
    }

    delete_onclick(e) {
        e.preventDefault();
        toastr.info('Not implemented');
    }

    // modal start
    showModal(e) {
        e.preventDefault();
        this.setState({
            resetUserId: this.state.selectedId
        });
        this.refs.modal.show();
    }

    hideModal(e) {
        e.preventDefault();
        this.refs.modal.hide();
    }

    async handleModal(e) {
        e.preventDefault();
        const mess = await api.common.get('reset-password', this.state.resetUserId);
        if (mess.success) {
            toastr.success(
                `Password was reset and was send to user by ${process.env.NODE_ENV !== 'development' ? 'SMS' : 'EMAIL'}!`,
                'Password was reset successfully!',
                {
                    timeOut: 3000,
                    fadeOut: 3000
                }
            );
        } else {
            toastr.warning(
                'First, please check if user has phone number! If user has phone number receive this message again, please contact application support!',
                'Something wrong happened!',
                {
                    timeOut: 5000,
                    fadeOut: 5000
                }
            )
        }
        this.refs.modal.hide();
    }
    // modal end
    
    renderBlockButton(user) {
        if (this.props.user.isAdmin) {
            return (
                <span onClick={e => this.block_onclick(e)}>
                    <i className={user.isActive ? "icon-wlc-block-2" : "icon-wlc-ok"}></i>{user.isActive ? 'Suspend' : 'Activate'}
                </span>
            );
        }
    }

    render() {
        const canEdit = this.props.user.isAdmin;
        return ([
            <div className="content" key={0}>
                <div className="content-box">
                    <div className="content-box-header">
                        <h3> Easy Officers </h3>
                        { canEdit && <a
                            onClick={e => this.open_onclick(e, 'officerprofile', false)}
                            className="button blue">
                            <i className="icon-wlc-plus"></i>
                            New Officer
                        </a> }
                    </div>
                    <div className="content-box-body" onClick={() => { this.setState({ selectedId: null }); }}>

                        <InfiniteScroll className="scrollbar"
                            hasMore={this.props.user.total > this.props.user.list.length}
                            isLoading={this.props.user.isLoading}
                            onLoadMore={this.props.loadMore}>
                            {this.props.user.list.map((user, i) => {
                                return (
                                    <div key={i} className={`box items-3 profile-box${this.state.selectedId === user.id ? ' view-more-options-list' : ''}`}>
                                        <div className="profile-box-img"><img src="/cms/img/svg/user.svg" alt="" /></div>
                                        <div className="table">
                                            <div className="table-cell">
                                                <h2>{user.firstName} {user.lastName}</h2>
                                                <div className="profile-box-grid">
                                                    <div className="profile-box-cell">
                                                        <p>Mark: <strong>{user.marca}</strong></p>
                                                        <p>Teamleader: <strong>{user.managerMarca ? `${user['manager.firstName'] || 'n/a'} ${user['manager.lastName'] || ''}` : 'n/a'}</strong></p>
                                                        <p>Partner: <strong>{user['canal.denumire'] || 'n/a'}</strong></p>
                                                    </div>
                                                    <div className="profile-box-cell">
                                                        <p>App: <strong>PPC Easy</strong></p>
                                                        <p>Last login: <strong>{user.lastLogin ? moment(user.lastLogin).format('DD.MM.YYYY') : 'n/a'}</strong></p>
                                                        <p>Valid until: <strong>{user.validityEndDate ? moment(user.validityEndDate).format('DD.MM.YYYY') : 'n/a'}</strong></p>
                                                    </div>
                                                    <div className="profile-box-cell">
                                                        <p><a className="cnt-btn" href="#">Phone: <strong>{user.phone || 'n/a'}</strong></a></p>
                                                        <p><a className="cnt-btn" href="#">Email: <strong>{user.email || 'n/a'}</strong></a></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <i className="icon-wlc-more-options square-btn-light trigger-profile-options" onClick={this.menu_onclick(user.id)}></i>
                                        <div className="more-options-list">
                                            <span onClick={e => this.open_onclick(e, 'officerprofile')}><i className="icon-wlc-agent"></i>Profile</span>
                                            <span onClick={e => this.open_onclick(e, 'easyofficers')}><i className="icon-wlc-info"></i>Activity</span>
                                            { this.renderBlockButton(user) }
                                            <span onClick={e => this.showModal(e)}><i className="icon-wlc-alert"></i>Reset password</span>
                                            {/* <span onClick={this.delete_onclick}><i className="icon-wlc-delete"></i>Delete</span> */}
                                        </div>
                                    </div>
                                );
                            })}
                        </InfiniteScroll>
                    </div>
                </div>
            </div>,
            <div className="flex-sidebar" key={1}>
                <div className="flex-sidebar-header">
                    <h3>Contract Status</h3>
                </div>
                <div className="scrollbar">
                    <div className="box mar0b">
                        <ul className="stats">
                            <li>
                                <strong>Total contracts today</strong>
                                <span>{this.props.counter.today}</span>
                            </li>
                            <li>
                                <strong>Total contracts this week</strong>
                                <span>{this.props.counter.week}</span>
                            </li>
                            <li>
                                <strong>Total contracts this month</strong>
                                <span>{this.props.counter.month}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>,
            <div key={2} className="view-overlay-alert">
                <DropModal
                    className="modal overlay-alert"
                    ref={'modal'}>
                    <div className="overlay-content">
                        <i
                            className="icon-wlc-close close-button-overlay close-overlay"
                            onClick={e => this.hideModal(e)}
                        />
                        <div className="overlay-body">
                            <div className="scrool-bar">
                                <h3>Are you sure?</h3>
                                <p>{`This will reset the user's password and send it by ${process.env.NODE_ENV !== 'development' ? 'SMS' : 'EMAIL'}!`}</p>
                                <p>{`Are you sure?`}</p>
                                <p className="align-center">
                                    <button className="button blue close-overlay" onClick={async e => this.handleModal(e)}>
                                        {'RESET PASSWORD'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </DropModal>
            </div>
        ]
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
        user: state.user,
        counter: state.session.count
    };
}, dispatch => {
    return {
        initAgents: () => {
            dispatch(async (dispatch, getState) => {
                dispatch({ type: 'AGENTS_LOADING' });
                let agents = await api.common.find('users', null, 20, 0, 'createdAt', false);
                dispatch({
                    type: 'INIT_AGENTS', payload: {
                        total: agents.total,
                        sortColumn: 'createdAt',
                        ascending: false,
                        data: agents.data
                    }
                });
            });
        },
        loadMore: () => {
            dispatch(async (dispatch, getState) => {
                const state = getState();

                dispatch({ type: 'AGENTS_LOADING' });
                let agents = await api.common.find('users', null, 20, state.user.currentIndex, state.user.sortColumn, state.user.ascending);
                dispatch({ type: 'APPEND_AGENTS', payload: agents });
            });
        },
        initCounters: () => {
            dispatch(async (dispatch, getState) => {
                const today = await api.session.countToday(window.ANDROID_APP1);
                const week = await api.session.countWeek(window.ANDROID_APP1);
                const month = await api.session.countMonth(window.ANDROID_APP1);

                dispatch({
                    type: 'D2D/INIT_COUNTERS', payload: {
                        today,
                        week,
                        month
                    }
                });
            });
        }
    };
})(AgentList);