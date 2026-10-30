import React, { Component } from 'react';

// TODO Remove lodash library
import _ from 'lodash';

import ImagesOverlay from 'components/overlays/ImagesOverlay';
import Scanner from 'components/Scanner';
import Loader from 'components/Loader';
import { FormErrors } from 'components/form';
import { addFormError } from '../../../services/form';

import './DocList.scss';

interface Props {
    docs?: any;
    enableAdd?: boolean;
    onAdd?: (file: File, docIndex: number) => void;
    onDelete: (docIndex: any, index: any) => void;
    onPhoto?: (photo: string) => void;
    loading?: boolean;
    maxFileSize: number;
}

interface State {
    modalDoc: string;
    showScanner: boolean;
    formErrors: object;
}

export class DocList extends Component<Props, State> {
    private _targetElement: HTMLElement;
    private _overlay: ImagesOverlay;

    public readonly state = {
        modalDoc: null,
        showScanner: false,
        formErrors: {},
    };

    constructor(props) {
        super(props);
    }

    public componentDidMount(): void {
        this._targetElement = document.querySelector('.DocModal');
    }

    public render(): JSX.Element {
        return (
            <div>
                <ImagesOverlay
                    show={!!this.state.modalDoc}
                    title={this.state.modalDoc && this.props.docs[this.state.modalDoc].title}
                    images={this.state.modalDoc ? this.props.docs[this.state.modalDoc].images : []}
                    onHide={() => this.setState({ modalDoc: null })}
                    ref={c => (this._overlay = c)}
                />
                <div className={`DocList ${this.props.loading ? 'loading' : ''}`}>
                    {/*// TODO Remove title={null}*/}
                    {this.props.loading && <Loader title={null} show />}
                    <div className="row">
                        {_.map(this.props.docs, (doc, docIndex) => {
                            let inputElement: HTMLElement;
                            return (
                                <div className="col-md-12" key={`document-${doc.title}`}>
                                    <div className="document spaced-top">
                                        <FormErrors
                                            errors={this.state.formErrors[`document-${docIndex}`]}
                                        />
                                        <p className="doc-title">{doc.title}</p>
                                        {_.map(doc.images, (image, index) => (
                                            <div
                                                key={`document-${doc.title}-page-${index}`}
                                                className="doc-image"
                                            >
                                                <img
                                                    className="document-photo"
                                                    src={image}
                                                    onClick={() => this._openModal(docIndex, index)}
                                                    alt=""
                                                />
                                                {_.size(doc.images) > 1 && (
                                                    <p className="page-title">{`Pagina ${index +
                                                        1}`}</p>
                                                )}
                                                <span
                                                    className="delete-button"
                                                    onClick={() =>
                                                        this.props.onDelete(docIndex, index)
                                                    }
                                                    role="presentation"
                                                >
                                                    <svg viewBox="0 0 40 40">
                                                        <path
                                                            className="close-x"
                                                            d="M 10,10 L 30,30 M 30,10 L 10,30"
                                                        />
                                                    </svg>
                                                </span>
                                            </div>
                                        ))}
                                        <div className="doc-image doc-add">
                                            <div className="img-wrapper">
                                                <i
                                                    className="ion-md-add add"
                                                    onClick={() => inputElement.click()}
                                                />
                                                <input
                                                    className="input-upload"
                                                    id={docIndex}
                                                    type="file"
                                                    ref={e => (inputElement = e)}
                                                    onChange={e => this._onFileChange(e, docIndex)}
                                                />
                                                {/* <i className="ion-ios-camera camera hide-mobile" onClick={()=> this.setState({ showScanner: true })} /> */}
                                            </div>
                                            {_.size(doc.images) > 1 && (
                                                <p className="page-title">Pagina</p>
                                            )}
                                        </div>
                                        {this.state.showScanner && (
                                            <Scanner
                                                onPicture={e => {
                                                    this.props.onPhoto(e);
                                                    this.setState({ showScanner: false });
                                                }}
                                                onBack={() => this.setState({ showScanner: false })}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    private _openModal(docIndex: string, index: any): void {
        this.setState({ modalDoc: docIndex }, () => {
            const node = this._overlay.modal.childNodes[index] as HTMLElement;
            this._overlay.modal.scrollTop = node.offsetTop;
        });
    }

    private async _onFileChange(e: any, docIndex: any): Promise<void> {
        const file = e.target.files[0];
        if (!file) return;

        if (this.props.maxFileSize && file.size > this.props.maxFileSize) {
            await addFormError(
                this,
                `document-${docIndex}`,
                'Dimensiunea fisierului depaseste 10MB. Va rugam incarcati un fisier cu o dimensiune mai mica'
            );
            return;
        } else {
            this.setState({ formErrors: {} });
        }

        this.props.onAdd(file, docIndex);
    }
}
