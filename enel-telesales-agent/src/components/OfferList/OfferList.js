import React, { Fragment, Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import _ from 'lodash';

import OfferCard from 'components/OfferCard';
import Loader from 'components/Loader';

import './OfferList.scss';

class OfferList extends Component {
    static propTypes = {
        onClose: PropTypes.func,
    };

    static defaultProps = {
        onClose: () => {},
    };

    wrapper = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.show !== this.props.show) {
            if (this.props.show) {
                this.handleShow();
            } else {
                this.handleHide();
            }
        }
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    getPlan(offer) {
        return Array.isArray(offer) ? offer : [offer];
    }

    handleShow() {
        disableBodyScroll(this.wrapper.current);
    }

    handleHide() {
        enableBodyScroll(this.wrapper.current);
    }

    renderLoading() {
        const { eeOffers, gazOffers, comboOffers } = this.props;
        return (
            <Loader show={_.isEmpty(eeOffers) && _.isEmpty(gazOffers) && _.isEmpty(comboOffers)} />
        );
    }

    renderOffers(offers, type) {
        if (!_.isEmpty(offers)) {
            return _.map(offers, (item, index) => (
                <OfferCard
                    plan={this.getPlan(item)}
                    key={`${index}-${type}`}
                    type={type}
                    onSelect={e => this.props.onSelect(e, this.getPlan(item))}
                    onMore={e => this.props.onMore(e, this.getPlan(item))}
                />
            ));
        }
    }

    render() {
        const { eeOffers, gazOffers, comboOffers } = this.props;
        return (
            <Fragment>
                <div
                    className={`OfferList__overlay  ${this.props.show ? 'show' : ''}`}
                    onClick={this.props.onClose}
                />
                <div className={`OfferList ${this.props.show ? 'show' : ''}`} ref={this.wrapper}>
                    {this.renderLoading()}
                    {this.renderOffers(eeOffers, 'ee')}
                    {this.renderOffers(gazOffers, 'gaz')}
                    {this.renderOffers(comboOffers, 'combo')}
                </div>
            </Fragment>
        );
    }
}

export default OfferList;
