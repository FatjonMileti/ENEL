import React, { Component } from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';

import _ from 'lodash';

import ImagesOverlay from 'components/overlays/ImagesOverlay';
import Scanner from 'components/Scanner';
import Loader from 'components/Loader';

import FormErrors from 'components/FormErrors';

import './DocList.scss';

const propTypes = {
    docs: PropTypes.object,
    enableAdd: PropTypes.bool,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func.isRequired,
    onPhoto: PropTypes.func,
};

const defaultProps = {
    docs: {},
    enableAdd: false,
    onAdd: () => {},
    onPhoto: () => {},
};

class DocList extends Component {
    state = {
        open: false,
        doc: null,
        showScanner: false,
    };

    inputs = {};

    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.targetElement = document.querySelector('.DocModal');
    }

    openModal(docIndex, pageIndex) {
        this.setState(
            {
                open: true,
                doc: docIndex,
            },
            () => {
                this.overlay.modal.scrollTop = this.overlay.modal.childNodes[pageIndex].offsetTop;
            }
        );
    }

    closeModal() {
        this.setState({
            open: false,
            doc: null,
        });
    }

    handleAdd(e, docIndex) {
        this.inputs[docIndex].current.click();
        if (this.props.onClick) {
            this.props.onClick(e);
        }
    }

    handlePhotoBack() {
        this.setState({ showScanner: false });
    }

    handlePhotoTake(image) {
        this.props.onPhoto(image);
        this.handlePhotoBack();
    }

    handleCamera() {
        this.setState({ showScanner: true });
    }

    renderScanner() {
        if (this.state.showScanner) {
            return <Scanner onPicture={this.handlePhotoTake} onBack={this.handlePhotoBack} />;
        }
    }

    renderAddPage(doc, docIndex) {
        if (!this.inputs[docIndex]) {
            this.inputs[docIndex] = React.createRef();
        }
        return (
            <div className="doc-image doc-add">
                <div className="img-wrapper">
                    <i className="ion-md-add add" onClick={e => this.handleAdd(e, docIndex)} />
                    <input
                        className="input-upload"
                        id={docIndex}
                        type="file"
                        ref={this.inputs[docIndex]}
                        onClick={(e) => e.target.value = ''}
                        onChange={e => {
                            this.props.onAdd(e, docIndex);
                        }}
                    />
                    <i className="ion-ios-camera camera hide-mobile" onClick={this.handleCamera} />
                </div>
                {_.size(doc.images) > 1 && <p className="page-title">Pagina</p>}
            </div>
        );
    }

    renderDocs() {
        return _.map(this.props.docs, (doc, docIndex) => (
            <div className="col-md-12" key={`document-${doc.title}`}>
                <div className="document spaced-top">
                    {this.props.errors && this.props.errors[docIndex] && (
                        <div style={{ marginTop: '16px', marginBottom: '-2rem' }}>
                            <FormErrors
                                errors={['Va rugam incarcati un fisier cu o dimensiune mai mica']}
                                title="Dimensiunea fisierului depaseste 10MB."
                            />
                        </div>
                    )}
                    <p className="doc-title">{doc.title}</p>
                    {_.map(doc.images, (image, index) => (
                        <div className="doc-image" key={`document-${doc.title}-page-${index}`}>
                            <img
                                className="document-photo"
                                src={image}
                                onClick={e => {
                                    this.openModal(docIndex, index);
                                }}
                                alt=""
                            />
                            {_.size(doc.images) > 1 && (
                                <p className="page-title">{`Pagina ${index + 1}`}</p>
                            )}
                            <span
                                className="delete-button"
                                onClick={() => this.props.onDelete(docIndex, index)}
                                role="presentation"
                            >
                                <svg viewBox="0 0 40 40">
                                    <path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
                                </svg>
                            </span>
                        </div>
                    ))}
                    {this.renderAddPage(doc, docIndex)}
                    {this.renderScanner()}
                </div>
            </div>
        ));
    }

    render() {
        const { loading } = this.props;
        return (
            <div>
                <ImagesOverlay
                    title={this.state.doc && this.props.docs[this.state.doc].title}
                    show={this.state.open}
                    images={this.state.doc ? this.props.docs[this.state.doc].images : []}
                    onHide={this.closeModal}
                    ref={c => {
                        this.overlay = c;
                    }}
                />
                <div className={`DocList ${loading ? 'loading' : ''}`}>
                    {loading && <Loader show />}
                    {!_.isEmpty(this.props.docs) && (
                        <section className="DocList documente-incarcate">
                            {/* <div className="row">
                                <div className="col-md-12">
                                    <h2 className="sm">{this.props.title}</h2>
                                </div>
                            </div> */}
                            <div className="row">{this.renderDocs()}</div>
                        </section>
                    )}
                </div>
            </div>
        );
    }
}

DocList.propTypes = propTypes;
DocList.defaultProps = defaultProps;

export default DocList;
