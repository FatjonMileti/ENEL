import React, { Component } from 'react';
import autoBind from 'react-autobind';
import moment from 'moment';

import { Button } from 'components/Button';

import './Reminder.scss';

class Reminder extends Component {
    state = {};

    constructor(props) {
        super(props);
        autoBind(this);
    }

    getExpiryParams(actionDate) {
        const now = moment();
        const expiryDate = moment(actionDate);
        const duration = moment.duration(expiryDate.diff(now));
        const hours = duration.asHours();

        if (hours > 24 || hours < -24) {
            return {
                value: Math.round(duration.asDays()),
                originalValue: duration.asDays(),
                label: 'Zile',
            };
        }

        return {
            value: Math.round(hours),
            originalValue: hours,
            label: 'Ore',
        };
    }

    render() {
        const reminder = this.props.data;
        let { createdAt, actionDate } = reminder;
        const expiryParams = this.getExpiryParams(actionDate);
        createdAt = moment(reminder.createdAt).format('DD.MM.YYYY, HH:mm:ss');
        actionDate = moment(reminder.actionDate).format('DD.MM.YYYY, HH:mm:ss');

        return (
            <div className="Reminder">
                <div className="reminder-header">
                    <div className="reminder-title">{reminder['lead.fullName']}</div>
                </div>
                <div className="reminder-content">
                    <div className="action-type">
                        Actiune necesara: <span className="action-value">suna</span>
                    </div>
                    <div className="details">
                        <div
                            className={`countdown ${
                                expiryParams.originalValue < 0 ? 'expired' : ''
                            }`}
                        >
                            <div className="countdown-label">
                                {expiryParams.originalValue >= 0 ? 'Expira' : 'Expirat'}
                            </div>
                            <div className="countdown-value">{Math.abs(expiryParams.value)}</div>
                            <div className="countdown-label">{expiryParams.label}</div>
                        </div>
                        <div className="info">
                            <div className="info-label">Data setare reminder</div>
                            <div className="info-value">{createdAt}</div>
                            <div className="info-label">Data programata pentru apel</div>
                            <div className="info-value">{actionDate}</div>
                        </div>
                    </div>
                    <div className="actions">
                        <Button info value="Inchide" onClick={this.props.onClose} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Reminder;
