import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import moment from 'moment';
import ConfirmModal from '../../../blocks/modals/ConfirmModal';

import _ from 'lodash';

class Table extends React.Component {
    state = {
        selectedId: null
    }

    constructor(props) {
        super(props);
        autoBind(this);
    }

    deleteModal = React.createRef();

    handleClickedItem(id) {
        return (e) => {
            e.stopPropagation();

            if (id !== this.state.selectedId)
                this.setState({ selectedId: id });
            else
                this.setState({ selectedId: null });
        };
    }

    handleDeleteItem() {
        this.deleteModal.current.show();
    }

    handleEditItem = item => () => {
        this.props.onEditItem(item);
    }

    handleConfirmDeleteItem() {
        this.props.onDeleteItem(this.state.selectedId);
        this.setState({ selectedId: null });
    }

    handleModalHide() {
        this.setState({ selectedId: null });
    }

    renderItems() {
        return _.map(this.props.whitelist.data, item => (
            <li key={item.id} className={item.id === this.state.selectedId ? 'view-more-options-list' : ''}>
                <ul>
                    <li><strong>{item.email || '-'}</strong></li>
                    <li><strong>{item.phone}</strong></li>
                    <li><strong>{moment(item.createdAt).format('HH:mm DD.MM.YYYY') || '-'}</strong></li>
                </ul>
                <i onClick={this.handleClickedItem(item.id)} className="icon-wlc-more-options square-btn-light trigger-edit-row"></i>
                <div className={`more-options-list dynamic-list whitelist`}>
                    <span className="menu-list" onClick={this.handleDeleteItem}><i className="icon-wlc-delete"></i>Delete Item</span>
                    {/* <span className="menu-list" onClick={this.handleEditItem(item)}><i className="icon-wlc-edit"></i>Edit Item</span> */}
                </div>
            </li>
        ));
    };

    render() {
        return (
            <div className="box box-whitelist">
                <ConfirmModal
                    title="Are you sure you want to delete this item from the whitelist?"
                    confirmLabel="Delete"
                    dismissLabel="Cancel"
                    ref={this.deleteModal}
                    onConfirm={this.handleConfirmDeleteItem}
                    onHide={this.handleModalHide}
                />
                <ul className="table-ul whitelist">
                    <li className="table-ul-header">
                        <ul>
                            <li><strong>Email</strong></li>
                            <li className="whitelist-element"><strong>Phone</strong></li>
                            <li className="whitelist-date"><strong>Date</strong></li>
                        </ul>
                    </li>
                    {this.props.whitelist && this.renderItems()}
                </ul>
            </div>
        );
    }
}

export default connect(state => {
    return {
        router: state.router,
    };
})(Table);