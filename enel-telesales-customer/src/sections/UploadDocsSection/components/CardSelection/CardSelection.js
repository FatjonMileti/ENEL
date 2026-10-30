import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';
import Button from 'components/Button';
import Scanner from 'components/Scanner';

import './CardSelection.scss';

class CardSelection extends Component {
    state = {
        showScanner: false,
    };

    input = React.createRef();

    constructor(props) {
        super(props);
        autoBind(this);
    }

    handleButtonClick(e) {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
        this.input.current.click();
    }

    handlePhotoClick(e) {
        if (this.props.onClick) {
            this.props.onClick(e);
        }
        this.setState({ showScanner: true });
    }

    handlePhotoBack() {
        this.setState({ showScanner: false });
    }

    handlePhotoTake(image) {
        this.props.onPhoto(image);
        this.handlePhotoBack();
    }

    render() {
        const { onSelect } = this.props;
        return (
            <Fragment>
                {this.state.showScanner && (
                    <Scanner onPicture={this.handlePhotoTake} onBack={this.handlePhotoBack} />
                )}
                <div className="CardSelection">
                    <div className="container main-area spaced-top">
                        <div className="row">
                            <div className="col-md-12">
                                <input
                                    type="file"
                                    id="input-upload"
                                    onChange={onSelect}
                                    ref={this.input}
                                />
                                <label
                                    htmlFor="upload"
                                    className="round-button-text round-button-text round-button-text"
                                >
                                    <Button
                                        primary
                                        value="Selecteaza"
                                        onClick={this.handleButtonClick}
                                    />
                                    <Button
                                        primary
                                        underline
                                        value="Fotografiază"
                                        className="hide-mobile"
                                        onClick={this.handlePhotoClick}
                                    />
                                    <p>
                                        Încarcă o fotografie existentă
                                        <br />
                                        *pdf, png, jpg, jpeg
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default CardSelection;
