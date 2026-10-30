import React from 'react';
import './ConfirmOverlay.scss';

import Button from 'components/Button';

const ConfirmOverlay = ({
    show,
    big,
    title,
    description,
    noFixed,
    noLogo,
    noConfirm,
    noDismiss,
    confirmLabel,
    dismissLabel,
    onConfirm,
    onDismiss,
}) => (
    <div
        className={`ConfirmOverlay ${show && 'show'} ${big && 'big'} ${noFixed &&
            'no-fixed'} ${noLogo && 'no-logo'}`}
    >
        <div className="row">
            <div className="col-11">
                {' '}
                {/*<div className="title">{title}</div>*/}
            </div>
            <div className="col-1">
                <button className="close" onClick={onDismiss}>
                    x
                </button>
            </div>
        </div>
        {!noLogo && (
            <div className="logo">
                <img src="/imgs/PPC_logo_negative.svg" alt="" />
            </div>
        )}
        <div className="content">
            <div className="row">
                <div className="col-12">
                    {' '}
                    <div className="title">{title}</div>
                </div>
            </div>
            <div className="description">{description}</div>

            <div className="buttons col-md-12">
                {!noDismiss && <Button primary underline value={dismissLabel} onClick={onDismiss} />}
                {!noConfirm && <Button primary value={confirmLabel} onClick={onConfirm} />}
            </div>
        </div>
    </div>
);

export default ConfirmOverlay;
