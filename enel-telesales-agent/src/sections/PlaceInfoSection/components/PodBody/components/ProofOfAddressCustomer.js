import React, { Component, Fragment } from 'react';

import { Text, Select } from 'components/form';

import { laterThanToday, maxLength, mix, month, required } from 'services/rules';
import moment from 'moment';

class ProofOfAddressCustomer extends Component {
    constructor(props) {
        super(props);
        const { place } = this.props;
        this.state = {
            customerRoles: [
                { value: 'proprietar', label: 'Proprietar' },
                { value: 'coproprietar', label: 'Coproprietar' },
                {
                    value: 'uzufructuar/beneficiar al dreptului de abitatie',
                    label: 'Uzufructuar/Beneficiar al dreptului de abitatie',
                },
                { value: 'chirias/comodatar', label: 'Chirias/Comodatar' },
                { value: 'unic mostenitor', label: 'Unic mostenitor' },
                { value: 'comostenitor', label: 'Comostenitor' },
                { value: 'sot supravietuitor', label: 'Sot supravietuitor' },
                { value: 'fara acte', label: 'Fara acte' },
                { value: 'alte cazuri', label: 'Alte cazuri' },
            ],
            showDataValabilitate: place && place.ownership_role === 'chirias/comodatar',
            showCustomCustomerRoleInput: place && place.ownership_role === 'alte cazuri',
        };

        this.updateState = this.updateState.bind(this);
    }

    updateState(e) {
        if (e.target.value === 'alte cazuri') {
            this.setState({ showDataValabilitate: false });
            this.setState({ showCustomCustomerRoleInput: true });
        } else if (e.target.value === 'chirias/comodatar') {
            this.setState({ showDataValabilitate: true });
            this.setState({ showCustomCustomerRoleInput: false });
        } else {
            this.setState({ showDataValabilitate: false });
            this.setState({ showCustomCustomerRoleInput: false });
        }
    }

    render() {
        const { index, place } = this.props;
        // console.log(this.props.supply, this.props.sw_titular, this.props.sw_provider);
        return (
            <Fragment>
                <div className="group-name">Rol client</div>
                <div className="row">
                    <Select
                        className="col-md-6"
                        label="Rol client"
                        name={`loc_ownership_role-${index}`}
                        options={this.state.customerRoles}
                        onChange={e => this.updateState(e)}
                        initialValue={
                            place && place.ownership_role
                                ? place.ownership_role
                                : this.state.customerRoles[0].label
                        }
                    />
                </div>
                <div className="row">
                    {this.state.showDataValabilitate && (
                        <Text
                            className="col-md-4"
                            label="Data valabilitate act spatiu"
                            name={`loc_ownership_valabilitate-${index}`}
                            validate={mix(required, laterThanToday)}
                            type="date"
                            initialValue={
                                place &&
                                place.ownership_valabilitate &&
                                moment(place.ownership_valabilitate, 'YYYY-MM-DD').format(
                                    'DD.MM.YYYY'
                                )
                            }
                            highlight
                        />
                    )}
                    {this.state.showCustomCustomerRoleInput && (
                        <Text
                            className="col-md-4"
                            label="Alte cazuri "
                            name={`loc_ownership_role_desc-${index}`}
                            validate={maxLength(128)}
                            initialValue={place && place.ownership_role_desc}
                        />
                    )}
                    {this.props.supply && this.props.sw_titular && !this.props.sw_provider && (
                        <Text
                            className="col-md-6"
                            label="Data de la care se utilizeaza spatiu"
                            placeholder="mm/yyyy"
                            name={`loc_ownership_role_start_date-${index}`}
                            validate={mix(month, required)}
                            initialValue={place && place.ownership_role_start_date}
                        />
                    )}
                </div>
            </Fragment>
        );
    }
}

export default ProofOfAddressCustomer;
