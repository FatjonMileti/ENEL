import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import { history } from '../../store.js';

import InfiniteScroll from '../infiniteScroll.jsx';
import moment from 'moment';
import api from '../../api/index.js';
import ConfirmModal from '../../../blocks/modals/ConfirmModal';

import downloader from '../../helpers/download.js';
import buildFiltersFromState from '../../helpers/buildFiltersFromState.js';
import { parseLastStep, parseStatus, parseType } from '../../helpers/parse.js';

import _ from 'lodash';

const TYPE_LABELS = {
    email: 'email',
    phone: 'phone',
    emailString: 'email string',
};

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

    handleConfirmDeleteItem() {
        this.props.onDeleteItem(this.state.selectedId);
        this.setState({ selectedId: null });
    }

    handleModalHide() {
        this.setState({ selectedId: null });
    }

    renderItems() {
        return _.map(this.props.blacklist.data, item => (
            <li key={item.id} className={item.id === this.state.selectedId ? 'view-more-options-list' : ''}>
                <ul>
                    <li><strong>{item.value || '-'}</strong></li>
                    <li><strong>{TYPE_LABELS[item.fieldType] || '-'}</strong></li>
                    <li><strong>{moment(item.createdAt).format('HH:mm DD.MM.YYYY') || '-'}</strong></li>
                </ul>
                <i onClick={this.handleClickedItem(item.id)} className="icon-wlc-more-options square-btn-light trigger-edit-row"></i>
                <div className={`more-options-list dynamic-list blacklist`}>
                    <span className="menu-list" onClick={this.handleDeleteItem}><i className="icon-wlc-agent"></i>Delete Item</span>
                </div>
            </li>
        ));
    };

    render() {
        return (
            <div className="box box-blacklist">
                <ConfirmModal
                    title="Are you sure you want to delete this item from the blacklist?"
                    confirmLabel="Delete"
                    dismissLabel="Cancel"
                    ref={this.deleteModal}
                    onConfirm={this.handleConfirmDeleteItem}
                    onHide={this.handleModalHide}
                />
                <ul className="table-ul blacklist">
                    <li className="table-ul-header">
                        <ul>
                            <li><strong>Value</strong></li>
                            <li className="blacklist-element"><strong>Type</strong></li>
                            <li className="blacklist-date"><strong>Date</strong></li>
                        </ul>
                    </li>
                    {this.props.blacklist && this.renderItems()}
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