import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import moment from 'moment';

import _ from 'lodash';

class Table extends React.Component {
    state = {
        selectedId: null
    }
    typeOfRequest = {
       'CNPCUI': 'CNP/CUI',
        'COD_CLIENT': 'Cod client' ,
        'POD': 'POD' ,
        'PHONE': 'Numar telefon',
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
                    <li><strong>{item.id || '-'}</strong></li>
                    <li><strong>{this.typeOfRequest[item.requestType] || '-' }</strong></li>
                    <li><strong>{item.searchCriteria || '-'}</strong></li>
                    <li><strong>{item.clientId == 'fsd-telesales-agent' ? 'Telesaler' : item.clientId == 'fsd-android-app1' ? 'Mobile app user' : '-'}</strong></li>
                    <li><strong>{item.partenerName || '-'}</strong></li>
                    <li><strong>{item.userMarca || '-'}</strong></li>
                    <li><strong>{item.userFullName || '-'}</strong></li>
                    <li><strong>{moment(item.createdAt).format('HH:mm DD.MM.YYYY') || '-'}</strong></li>
                </ul>
            </li>
        ));
    };

    render() {
        return (
            <div className="box">
                <ul className="table-ul query-report-list">
                    <li className="table-ul-header">
                        <ul>
                            <li><strong>Nr interogare</strong></li>
                            <li><strong>Tip interogare</strong></li>
                            <li><strong>Valoare interogare </strong></li>
                            <li><strong>D2D/Shop/Telesales</strong></li>
                            <li><strong>Nume Partener</strong></li>
                            <li><strong>User </strong></li>
                            <li><strong>Nume</strong></li>
                            <li><strong>Data/Timp</strong></li>
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