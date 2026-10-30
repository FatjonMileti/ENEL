import React, { Fragment } from 'react';
import _ from 'lodash';

import { Checkbox } from 'components/form';

const Campaigns = ({ campaigns }) => {
    if (!_.isEmpty(campaigns)) {
        let items = _.map(campaigns, (campaign, index) => (
            <div key={index} className="row">
                <Checkbox
                    className="col-md-12"
                    name={`campaign_${campaign.id}`}
                    label={
                        <span>
                            Sunt de acord cu participarea la campania{' '}
                            <a
                                href={`${campaign.regulament || '#'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {campaign.denumire}
                            </a>
                        </span>
                    }
                />
            </div>
        ));

        return (
            <Fragment>
                <div className="group-name">Acord Concurs</div>
                {items}
            </Fragment>
        );
    }
    return null;
};

export default Campaigns;
