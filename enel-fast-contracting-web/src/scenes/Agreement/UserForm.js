import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import Input from 'components/validation/input';
import { required, email, tel } from 'components/validation/rules';

const propTypes = {
    form: PropTypes.object.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    confirmEmailValidations: PropTypes.object.isRequired,
};

const UserForm = ({ form, handleInputChange, confirmEmailValidations }) => (
    <Fragment>
        <div className={'row'}>

            <div className={'col-12 form-padding'}>
                <Input
                    name="firstName"
                    label=""
                    value={form.firstName}
                    onChange={handleInputChange}
                    errorLabel="Numele este necesar."
                    className="form-control"
                    containerClass="mb-6 col-md-12"
                    validations={[required]}
                    placeholder="Prenumele complet din cartea de identitate"
                    upperCase
                />
            </div>
            <div className={'col-12 form-padding'}>
                <Input
                    name="lastName"
                    label=""
                    value={form.lastName}
                    onChange={handleInputChange}
                    errorLabel="Prenumele este necesar."
                    className="form-control"
                    containerClass="mb-6 col-md-12"
                    validations={[required]}
                    placeholder="Numele din cartea de identitate"
                    upperCase
                />
            </div>
            <div className={'col-12 form-padding'}>
                <Input
                    name="clientEmail"
                    label=""
                    value={form.clientEmail}
                    onChange={handleInputChange}
                    errorLabel="Adresa de email este necesara."
                    className="form-control"
                    containerClass="mb-6 col-md-12"
                    validations={[required, email]}
                    placeholder="Adresa dvs. de email"
                />
            </div>
            <div className={'col-12 form-padding'}>
                <Input
                    name="confirmEmail"
                    label=""
                    value={form.confirmEmail}
                    onChange={handleInputChange}
                    errorLabel="Adresa de email este necesara."
                    className="form-control"
                    containerClass="mb-6 col-md-12"
                    validations={confirmEmailValidations}
                    placeholder="Confirma adresa dvs. de email"
                    autocomplete="chrome-off"
                />

            </div>
            <div className={'col-12 form-padding'}>
                <Input
                    name="clientPhoneNumber"
                    label=""
                    value={form.clientPhoneNumber}
                    onChange={handleInputChange}
                    errorLabel="Telefonul mobil este necesar."
                    className="form-control"
                    containerClass="mb-6 col-md-12"
                    validations={[required, tel]}
                    placeholder="Telefonul dvs. mobil"
                />
            </div>
        </div>


    </Fragment>
);

UserForm.propTypes = propTypes;

export default UserForm;
