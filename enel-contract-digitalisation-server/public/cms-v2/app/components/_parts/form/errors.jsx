import React from 'react';

export default (props) => {
    return (
        <div className={`error-msg box-msg ${!props.show && 'hidden'}`}>
                {props.errors}
        </div>
    )
}
