import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import _ from 'lodash';

import { dataURLtoBlob } from 'utils';
import ImagesOverlay from 'components/overlays/ImagesOverlay';

import './DocList.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    docs: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
};

const defaultProps = {
    docs: {},
};

class DocList extends Component {
    state = {
        open: false,
        doc: null,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.targetElement = document.querySelector('.DocModal');
    }

    openModal(docIndex, pageIndex) {
        this.setState({
            open: true,
            doc: docIndex,
        }, () => {
            this.overlay.modal.scrollTop = this.overlay.modal.childNodes[pageIndex].offsetTop;
        });
    }

    closeModal() {
        this.setState({
            open: false,
            doc: null,
        });
    }

    renderDocs() {
        return _.map(this.props.docs, (doc, docIndex) => (
            <div className="col-md-12" key={`document-${doc.title}`}>
                <div className="document spaced-top">
                    <p className="doc-title eyebrow georgia">{doc.title}</p>
                    {_.map(doc.images, (image, index) => (
                        <div className="doc-image" key={`document-${doc.title}-page-${index}`}>
                            <img className="document-photo" src={image} onClick={(e) => { this.openModal(docIndex, index); }} />
                            {_.size(doc.images) > 1 && <p className="page-title">{`Pagina ${index + 1}`}</p>}
                            <span className="delete-button" onClick={() => this.props.onDelete(docIndex, index)}>
                                <svg viewBox="0 0 40 40">
                                    <path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
                                </svg>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ));
    }

    render() {
        return (
            <div>
                <ImagesOverlay
                    title={this.state.doc && this.props.docs[this.state.doc].title}
                    show={this.state.open}
                    images={this.state.doc ? this.props.docs[this.state.doc].images : []}
                    onHide={this.closeModal}
                    ref={(c) => { this.overlay = c; }}
                />
                <div className="DocList">
                    {!_.isEmpty(this.props.docs) &&
                        <section className="DocList documente-incarcate spaced-top-lg">
                            <div className="row">
                                <div className="col-md-12"><h2 className="sm">{this.props.title}</h2></div>
                            </div>
                            <div className="row">
                                {this.renderDocs()}
                            </div>
                        </section>
                    }
                </div>
            </div>
        );
    }
}

DocList.propTypes = propTypes;
DocList.defaultProps = defaultProps;

export default DocList;
