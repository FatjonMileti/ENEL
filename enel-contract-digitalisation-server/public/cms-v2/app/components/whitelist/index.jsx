import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import api from '../../api/index.js';

import Table from './page.jsx';
import SidebarContainerOverview from '../overview/sidebarContainerOverview.jsx';
import WhitelistModal from './components/WhitelistModal/WhitelistModal.js';

class Whitelist extends React.Component {



    constructor(props) {
        super(props);
        this.state =
        {
            update: false,
            item: null,
        };
        autoBind(this);
    }

    whitelistModalEditCreate = React.createRef();

    componentDidMount() {
        this.props.initWhitelist();
    }

    componentDidUpdate(prevProps) {
    if (this.props.whitelist && (prevProps.whitelist.total != this.props.whitelist.total))
        this.props.initWhitelist();
    }


    handleWhitelistCreateClick(e) {
        this.setState({
            update: false
        });
        this.whitelistModalEditCreate.current.show();
    }

    async handleCreateItem(e, data) {
        await this.props.createItem(data);
        await this.props.initWhitelist();
    }

    async handleEditItem(e, data) {
        await this.props.updateItem(this.state.item.id, data);
        this.setState({
            update: false,
            item: null,
        })
        await this.props.initWhitelist();
    }

    async handleDeleteItem(id) {
        await this.props.deleteItem(id);
        await this.props.initWhitelist();
    }

    async onEditItem(item) {
        this.setState((prevState) => ({...prevState, item}));
        this.setState({ update: true});
        this.whitelistModalEditCreate.current.show();
    }

    async handleEditCreateItem(e, data) {
        if(this.state.update){
            await this.handleEditItem(e, data);
        } else {
            await this.handleCreateItem(e, data);
        }
    }
    async onDismiss(e) {
        this.setState({
            update: false,
            item: null,
        })
    }

    render() {
     console.log({item:this.state.item});
        return ([
            <div className="content" key={0}>
                <WhitelistModal
                    className='whitelist-modal'
                    ref={this.whitelistModalEditCreate}
                    confirmLabel="Create"
                    item={this.state.item}
                    onConfirm={this.handleEditCreateItem}
                    onDismiss={this.onDismiss}
                    dismissLabel="Cancel"
                />
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Whitelist</h3>
                        <a
                            onClick={e => this.handleWhitelistCreateClick(e)}
                            className="whitelist-create button black">
                            <i className="icon-wlc-plus"></i>
                            Add item
                        </a>
                    </div>
                    <div className="content-box-body content-box-body-whitelist">
                        <div className="scrollbar">
                            <Table 
                                whitelist={this.props.whitelist}
                                onDeleteItem={(id) => this.handleDeleteItem(id)}
                                onEditItem={this.onEditItem}
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
        whitelist: state.whitelist,
        router: state.router,
    };
}, dispatch => {
    return {
        createItem: (data) => {
            return dispatch(async (dispatch, getState) => {
                await api.whitelist.add(data);
            });
        },
        initWhitelist: () => {
            dispatch(async (dispatch, getState) => {
            
                let result = await api.whitelist.all();
                dispatch({ type: 'WHITELIST/ALL', payload: result });
            });
        },
        updateItem: (id, form) => {
            return dispatch(async (dispatch, getState) => {
            
                await api.whitelist.patch(id, form);
            });
        },
        deleteItem: (id) => {
            return dispatch(async (dispatch, getState) => {
            
                await api.whitelist.delete(id);
            });
        },
    };
})(Whitelist);