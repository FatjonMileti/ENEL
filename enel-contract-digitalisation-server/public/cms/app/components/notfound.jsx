import React from 'react';
import { connect } from 'react-redux';

class NotFound extends React.Component {
    render() {
        return (
            <div className="content" key={0}>
                <div className="content-box content-box-with-tabs">
                    <div className="content-box-header">
                        <h1>NOT FOUND</h1>
                    </div>
                </div>
            </div>
        );
    }
}

export default NotFound;