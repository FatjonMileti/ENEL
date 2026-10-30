import React from 'react';

class SidebarAlertComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="flexsidebar-alert">
                <p><strong>{this.props.totalPending}</strong> total contracts pending activation</p>
            </div>
        );
    }
}

export default (SidebarAlertComponent);