import React from 'react';

import './ItemOption.scss';

const ItemOption = ({ icon, label, onClick, href, anchor, hide, ...props }) => {
    if (hide) {
        return null;
    }

    if (anchor) {
        return (
            <div className="ItemOption">
                <a href={href} target="_blank" rel="noopener noreferrer">
                    <i className={icon} />
                    {`${label}`}
                </a>
            </div>
        );
    }

    return (
        <div className="ItemOption" onClick={onClick}>
            <span>
                <i className={icon} />
                {`${label}`}
            </span>
        </div>
    );
};

export default ItemOption;
