import React from 'react';
import './ConfirmOverlay.scss';

import { Button } from 'components/Button';

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
        {!noLogo && (
            <div className="logo">
                <img src="/imgs/enel@2x.png" alt="" />
            </div>
        )}
        <div className="content">
            <div className="title">{title}</div>
            <div className="description">{description}</div>

            <div className="buttons col-md-12">
                {!noDismiss && <Button light underline value={dismissLabel} onClick={onDismiss} />}
                {!noConfirm && <Button light outline value={confirmLabel} onClick={onConfirm} />}
            </div>
        </div>
    </div>
);

export default ConfirmOverlay;
