import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import _ from 'lodash';

import './ImagesOverlay.scss';

const propTypes = {
    show: PropTypes.bool,
    images: PropTypes.array,
    title: PropTypes.string,
    onHide: PropTypes.func.isRequired,
};

const defaultProps = {
    show: false,
    images: [],
    title: '',
};

class ImagesOverlay extends Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.show && this.props.show) {
            this.handleShow();
        } else if (prevProps.show && !this.props.show) {
            this.handleHide();
        }
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    handleShow() {
        disableBodyScroll(this.modal);
    }

    handleHide() {
        enableBodyScroll(this.modal);
    }

    handleModalClose(e) {
        e.preventDefault();
        e.stopPropagation();
        this.modal.scrollTop = 0;
        this.props.onHide(e);
    }

    render() {
        return (
            <Fragment>
                <div className={`ImagesOverlay-DocTitle ${this.props.show ? 'show' : ''}`}>
                    {_.size(this.props.images) && this.props.title}
                </div>
                <div className={`ImagesOverlay-closeModal ${this.props.show ? 'show' : ''}`} onClick={this.handleModalClose}>
                    <svg version="1.1"
                        xmlns="http://www.w3.org/2000/svg">
                        <line
                            x1="1" y1="15"
                            x2="15" y2="1"
                        />
                        <line
                            x1="1" y1="1"
                            x2="15" y2="15"
                        />
                    </svg>
                </div>
                <div ref={(c) => { this.modal = c; }} className={`ImagesOverlay ${this.props.show ? 'show' : ''}`} onClick={this.handleModalClose}>
                    {_.size(this.props.images) &&
                        _.map(this.props.images, (image, index) => (
                            <img key={_.uniqueId()} className="DocPage" src={image} onClick={(e) => { e.preventDefault(); }} />
                        ))
                    }
                </div>
            </Fragment>
        );
    }
}

ImagesOverlay.propTypes = propTypes;
ImagesOverlay.defaultProps = defaultProps;

export default ImagesOverlay;
