import React from 'react';
import DocList from 'components/docs/DocList';

import './CardPreview.scss';

const CardPreview = ({ image, onDelete }) => (
    <div className="CardPreview text-center spaced-top">
        <span>
            <DocList
                docs={{
                    id: {
                        images: [image],
                    },
                }}
                onDelete={onDelete}
            />
        </span>
    </div>
);

export default CardPreview;
