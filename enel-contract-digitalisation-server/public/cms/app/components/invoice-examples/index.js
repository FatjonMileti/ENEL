import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import api from '../../api/index.js';
import _ from 'lodash';

import DropModal from 'reboron/DropModal';

class InvoiceExamples extends React.Component {
    state = {
        selectedId: null,
        currentGroup: null,
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.props.initInvoiceExamples();
        this.props.initProviders();
    }

    getProvider(id) {
        const provider = _.find(this.props.providers, (provider) => provider.internal_id == id);
        if (provider) {
            return provider.denumire;
        }
        return '---';
    }

    async handleAddClick(e) {
        e.preventDefault();
        await this.props.clearInvoiceExamples();
        this.props.history.push('/invoice-examples/add');
    }
    
    async handleEditClick(e, group) {
        e.preventDefault();
        await this.props.clearInvoiceExamples();
        await this.props.setCurrentInvoiceGroup(group);
        this.props.history.push('/invoice-examples/edit');
    }

    async handleDeleteClick(e, group) {
        e.preventDefault();
        this.setState({ currentGroup: group });
        this.deleteModal.show();
    }

    async handleDeleteConfirm(e) {
        e.preventDefault();
        const examples = this.props.invoiceExamples.filter(item => {
            const group = this.state.currentGroup;
            return (
                item.type == group.type &&
                item.market == group.market &&
                item.county == group.county &&
                item.furnizor_id == group.provider
            );
        });
        this.deleteModal.hide();

        await Promise.all(examples.map(example => this.props.deleteInvoice(example.id)))
        this.props.initInvoiceExamples();
    }

    handleDeleteCancel(e) {
        e.preventDefault();
        this.deleteModal.hide();
    }

    handleModalHide() {
        this.setState({ currentGroup: null });
    }

    handleMoreClick(e, index) {
        e.stopPropagation();
        this.setState({ selectedId: this.state.selectedId !== null ? null : index })
    }

    clearSelected(e) {
        this.setState({ selectedId: null })
    }

    renderGroups() {
        return _.map(this.props.invoiceGroups, (group, index) => (
            <li key={index} onClick={this.clearSelected} className={index === this.state.selectedId ? 'view-more-options-list' : ''}>
                <ul>
                    <li>{group.type || '---'}</li>
                    <li>{this.getProvider(group.provider)}</li>
                    <li>{group.county || '---'}</li>
                    <li>{group.market || '---'}</li>
                </ul>
                <i className="icon-wlc-more-options square-btn-light trigger-edit-row" onClick={e => this.handleMoreClick(e, index)}></i>
                <div className="more-options-list">
                    <span onClick={e => this.handleEditClick(e, group)}><i className="icon-wlc-edit"></i>Edit</span>
                    <span onClick={e => this.handleDeleteClick(e, group)}><i className="icon-wlc-delete"></i>Delete</span>
                </div>
            </li>
        ));
    }

    render() {
        return (
            <div className="content InvoiceExamples">
                <div className="view-overlay-alert">
                    <DropModal
                        className="modal overlay-alert"
                        ref={(modal) => { this.deleteModal = modal }}
                        onHide={this.handleModalHide}
                    >
                        <div className="overlay-content">
                            <i
                                className="icon-wlc-close close-button-overlay close-overlay"
                                onClick={this.handleDeleteCancel}
                            />
                            <div className="overlay-body">
                                <div className="scrool-bar">
                                    <h3>Are you sure you want to delete these examples?</h3>
                                    <p className="align-center">
                                        <button className="button blue close-overlay" onClick={this.handleDeleteConfirm}>
                                            Delete
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DropModal>
                </div>
                <div className="content-box">
                    <div className="content-box-header">
                        <h3>Invoice Examples</h3>
                        <a className="button blue" href="#" onClick={this.handleAddClick}>
                            <i className="icon-wlc-plus"></i>Add Example
                        </a>
                    </div>
                    <div className="content-box-body">
                        <div className="scrollbar">
                            <div className="box">
                                <ul className="table-ul invoice-examples">
                                    <li className="table-ul-header">
                                        <ul>
                                            <li><strong>Type</strong></li>
                                            <li><strong>Provider</strong></li>
                                            <li><strong>County</strong></li>
                                            <li><strong>Market</strong></li>
                                        </ul>
                                    </li>
                                    {this.renderGroups()}
                                </ul>
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
        invoiceExamples: state.invoice_examples.data,
        invoiceGroups: state.invoice_examples.groups,
        providers: state.provider.data,
    };
}, dispatch => {
    return {
        initInvoiceExamples: () => dispatch(async (dispatch, getState) => {
            const invoiceExamples = await api.invoice_example.all();
            dispatch({ type: 'INVOICE_EXAMPLES/ALL', payload: invoiceExamples });
        }),
        initProviders: () => {
            return dispatch(async (dispatch, getState) => {
                dispatch({ type: 'PROVIDER/LOADING' });
                const providers = await api.provider.all();
                
                dispatch({
                    type: 'PROVIDER/ALL',
                    payload: providers,
                });
            });
        },
        setCurrentInvoiceGroup: (currentGroup) => dispatch(async (dispatch, getState) => {
            dispatch({ type: 'INVOICE_EXAMPLES/SET_CURRENT_GROUP', payload: { currentGroup } });
        }),
        clearInvoiceExamples: () => dispatch(async (dispatch, getState) => {
            dispatch({ type: 'INVOICE_EXAMPLES/CLEAR' });
        }),
        deleteInvoice: (id) => dispatch(async (dispatch, getState) => {
            dispatch({ type: 'PROVIDER/LOADING' });
            await api.invoice_example.delete(id);
        }),
    }
})(InvoiceExamples);