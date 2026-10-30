import React, { Component } from 'react';
import { connect } from 'react-redux';
import autoBind from 'react-autobind';
import _ from 'lodash';

import { getItems as getReminders } from 'store/reminders/selectors';

import Reminder from './components/Reminder';

import './ReminderSidebar.scss';

class ReminderSidebar extends Component {
    closeReminderModal = React.createRef();

    state = {
        currentLead: null,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    render() {
        const { reminders, onCloseReminder } = this.props;
        return (
            <div className="ReminderSidebar">
                <h1 className="page-title">Reminders</h1>
                <div className="content">
                    {_.map(reminders, item => {
                        return <Reminder data={item} onClose={() => onCloseReminder(item)} />;
                    })}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    reminders: getReminders(state),
});

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReminderSidebar);
