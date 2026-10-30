import React from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import moment from 'moment';

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
        return _.map(this.props.variantePrets.data, item => (
            <li key={item.id} className={item.id === this.state.selectedId ? 'view-more-options-list' : ''}>
                <ul>
                    <li><strong>{item.cod || '-'}</strong></li>
                    <li><strong>{item.type || '-' }</strong></li>
                    <li><strong>{item.denumire || '-'}</strong></li>
                    <li><strong>{item.judet || '-'}</strong></li>
                    <li><strong>{item.furn24 === 1 ? '24 luni' : '12 luni' }</strong></li>
                    <li><strong>{item.seg || '-'}</strong></li>
                    <li><strong>{item.canal || '-'}</strong></li>
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
                            <li><strong>Cod oferta</strong></li>
                            <li><strong>Tip furnizare</strong></li>
                            <li><strong>Denumire</strong></li>
                            <li><strong>Judet</strong></li>
                            <li><strong>Perioada furnizare</strong></li>
                            <li><strong>Seg</strong></li>
                            <li><strong>Canal</strong></li>
                        </ul>
                    </li>
                    {this.props.variantePrets && this.renderItems()}
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
