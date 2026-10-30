import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import InfiniteScroll from '../infiniteScroll';
import _ from 'lodash';
import moment from 'moment';
import api from '../../api';
import toastr from 'toastr';
import { Promise } from 'bluebird';
import DropModal from 'reboron/DropModal';

import SidebarContainerOverview from '../overview/sidebarContainerOverview';
import ImportModal from './components/ImportModal';
import ImportStatusModal from './components/ImportStatusModal';

import { IMPORT_TEMPLATE as currentImportTemplate } from '../../helpers/officers';
class AgentList extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    state = {
        selectedId: null,
        resetUserId: null,
        imported: 0,
        importSelected: null,
        successful: null,
        errored: null,
    };

    importModal = React.createRef();
    importStatusModal = React.createRef();

    componentDidMount() {
        this.props.initAgents();
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
        return this.props.navigate(`/${slug}/${withId ? this.state.selectedId : 'new'}`);
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
        this.setState({ successful: null, errored: null, imported: 0 });
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

    handleImportOfficers(e) {
        this.importModal.current.show();
    }

    async handleConfirmImport(e, officers) {
        this.setState({ importSelected: _.size(officers) });
        this.importStatusModal.current.show();
       
        let i = 0;
        let successful = 0;
        let errored = 0;

        await Promise.map(
            officers,
            async officer => {
                try {
                    const result = await this.props.importOfficer(officer);
                    if (result.code && result.code >= 400) throw new Error();
                    successful++;
                } catch (error) {
                    console.log('errored');
                    errored++;
                    console.error({ importError: error });
                }
                i++;
                this.setState({ imported: i });
            },
            { concurrency: 20 }
        );

        this.setState({ successful, errored });
    }

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
                <ImportModal
                    ref={this.importModal}
                    onConfirm={this.handleConfirmImport}
                    template={currentImportTemplate}
                />
                <ImportStatusModal
                    ref={this.importStatusModal}
                    imported={this.state.imported}
                    successful={this.state.successful}
                    errored={this.state.errored}
                    total={this.state.importSelected}
                    onHide={this.handleImportModalHide}
                />
                <div className="content-box">
                    <div className="content-box-header">
                        <h3> Easy Officers </h3>
                        { 
                            canEdit && 
                            <Fragment>
                                <a
                                    onClick={e => this.handleImportOfficers(e)}
                                    className="import-officers button black">
                                    <i className="icon-wlc-plus"></i>
                                    Import Officers
                                </a> 
                                <a
                                    onClick={e => this.open_onclick(e, 'officerprofile', false)}
                                    className="button black">
                                    <i className="icon-wlc-plus"></i>
                                    New Officer
                                </a>
                            </Fragment>
                        
                        }
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
                                        </div>
                                    </div>
                                );
                            })}
                        </InfiniteScroll>
                    </div>
                </div>
            </div>,
            <SidebarContainerOverview key={1} />,
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
                                    <button className="button black close-overlay" onClick={async e => this.handleModal(e)}>
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
        importOfficer: (officer) => {
            return dispatch(async (dispatch, getState) => {

                return await api.common.post('users', officer, false);
            });
        },
    };
})(AgentList);