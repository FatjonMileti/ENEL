import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import api from '../../api/index.js';

import Table from './page.jsx';
import SidebarContainerOverview from '../overview/sidebarContainerOverview.jsx';
import BlacklistModal from './components/BlacklistModal';

class Blacklist extends React.Component {

    state =
        {
            update: false,
        };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    blacklistModal = React.createRef();

    componentDidMount() {
        this.props.initBlacklist();
    }

    componentDidUpdate(prevProps) {
    if (this.props.blacklist && (prevProps.blacklist.total != this.props.blacklist.total))
        this.props.initBlacklist();
    }


    handleBlacklistCreateClick(e) {
        this.blacklistModal.current.show();
    }

    async handleCreateItem(e, data) {
        await this.props.createItem(data);
        await this.props.initBlacklist();
    }

    async handleDeleteItem(id) {
        await this.props.deleteItem(id);
        await this.props.initBlacklist();
    }

    render() {
        return ([
            <div className="content" key={0}>
                <BlacklistModal
                    className='blacklist-modal'
                    ref={this.blacklistModal}
                    confirmLabel="Create"
                    onConfirm={this.handleCreateItem}
                    dismissLabel="Cancel"
                />
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Blacklist</h3>
                        <a
                            onClick={e => this.handleBlacklistCreateClick(e)}
                            className="blacklist-create button black">
                            <i className="icon-wlc-plus"></i>
                            Add item
                        </a>
                    </div>
                    <div className="content-box-body content-box-body-blacklist">
                        <div className="scrollbar">
                            <Table 
                                blacklist={this.props.blacklist}
                                onDeleteItem={(id) => this.handleDeleteItem(id)}
                            />
                        </div>
                    </div>
                </div>
            </div>,
            <SidebarContainerOverview key={1} />
        ]);
    }
}

export default connect(state => {
    return {
        blacklist: state.blacklist,
        router: state.router,
    };
}, dispatch => {
    return {
        createItem: (data) => {
            return dispatch(async (dispatch, getState) => {
                await api.blacklist.add(data);
            });
        },
        initBlacklist: () => {
            dispatch(async (dispatch, getState) => {
            
                let result = await api.blacklist.all();
                dispatch({ type: 'BLACKLIST/ALL', payload: result });
            });
        },
        deleteItem: (id) => {
            return dispatch(async (dispatch, getState) => {
            
                await api.blacklist.delete(id);
            });
        },
    };
})(Blacklist);