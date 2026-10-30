import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import Input from 'components/validation/input';
import { required, email, tel, matchEmail } from 'components/validation/rules';

const propTypes = {
    form: PropTypes.object.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    confirmEmailValidations: PropTypes.array.isRequired,
};

const CompanyForm = ({ form, handleInputChange, confirmEmailValidations }) => (
    <Fragment>
        <Input
            name="companyName"
            label=""
            value={form.companyName}
            onChange={handleInputChange}
            errorLabel="Numele societatii este necesar."
            className="form-control"
            containerClass="mb-3 col-md-12"
            validations={[required]}
            placeholder="Numele complet al societatii"
            upperCase
        />
        <Input
            name="companyRepresentativeName"
            label=""
            value={form.companyRepresentativeName}
            onChange={handleInputChange}
            errorLabel="Numele este necesar."
            className="form-control"
            containerClass="mb-3 col-md-6"
            validations={[required]}
            placeholder="Prenumele complet al reprezentantului"
            upperCase
        />
        <Input
            name="companyRepresentativeLastame"
            label=""
            value={form.companyRepresentativeLastame}
            onChange={handleInputChange}
            errorLabel="Prenumele este necesar."
            className="form-control"
            containerClass="mb-3 col-md-6"
            validations={[required]}
            placeholder="Numele complet al reprezentantului"
            upperCase
        />
        <fieldset>
            <div className="col-md-12">
                <div className="row">
                    <Input
                        name="companyEmail"
                        label=""
                        value={form.companyEmail}
                        onChange={handleInputChange}
                        errorLabel="Adresa de email este necesara."
                        className="form-control"
                        containerClass="mb-3 col-md-6"
                        validations={[required, email]}
                        placeholder="Adresa dvs. de email"
                    />
                    <Input
                        name="confirmEmail"
                        label=""
                        value={form.confirmEmail}
                        onChange={handleInputChange}
                        className="form-control"
                        containerClass="mb-3 col-md-6"
                        validations={confirmEmailValidations}
                        placeholder="Confirmati adresa dvs. de email"
                        autocomplete="chrome-off"
                    />
                </div>
            </div>
        </fieldset>
        <Input
            name="companyTelefon"
            label=""
            value={form.companyTelefon}
            onChange={handleInputChange}
            errorLabel="Telefonul mobil este necesar."
            className="form-control"
            containerClass="mb-3 col-md-6"
            validations={[required, tel]}
            placeholder="Telefonul dvs. mobil"
        />
    </Fragment>
);

CompanyForm.propTypes = propTypes;

export default CompanyForm;
