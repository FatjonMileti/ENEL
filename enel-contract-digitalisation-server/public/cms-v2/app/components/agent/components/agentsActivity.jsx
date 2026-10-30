import React, { Fragment } from 'react';
import moment from 'moment';

class AgentsActivity extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Fragment>
                <h3 className="flex-sidebar-title-2">Agents Activity Overview</h3>
                <div className="box">
                    <p className="panel">
                        <span>Status:</span>
                        <strong><i className={`icon-wlc-active${this.props.active ? ' active' : ''}`}></i>{this.props.active ? 'Active' : 'Inactive'}</strong>
                    </p>
                    <p className="panel">
                        <span>Last login:</span>
                        <strong><i className="icon-wlc-calendar"></i>{this.props.login ? moment(this.props.login).format('DD.MM.YYYY h:mm A') : 'n/a'}</strong>
                    </p>
                </div>
            </Fragment>
        );
    }
}

export default (AgentsActivity);