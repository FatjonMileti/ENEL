import React, { useState, Fragment, useEffect } from 'react';
import { Text, Select } from '../../../../components/form';
import { FormErrors, FormSuccess } from 'components/form';
import { required, mix, email, tel, cui } from '../../../../services/rules';
import api from '../../../../services/api';
import { Button } from 'components/Button';

const CompanyIdentification = ({ formSuccess, formErrors, onValidateClick }) => {
    const [businessTypes, setBusinessTypes] = useState('');
    const [caenCodes, setCaenCodes] = useState('');
    useEffect(() => {
        // set business types
        api.get('/company-type').then(response => setBusinessTypes(response.data));

        // set caen codes
        let totalCaenCodes = 0;
        let limit = 0;
        let caenCodes = [];

        api.get('/cod-caen').then(response => {
            totalCaenCodes = response.total;
            limit = response.limit;
            response.data.map(code =>
                caenCodes.push({ value: code.cod, label: code.cod + code.denumire })
            );
            let pages = Math.ceil(totalCaenCodes / limit);
            Promise.all(
                Array.from({ length: pages - 1 }, (page, n) => {
                    return api.get(`/cod-caen?$skip=${(n + 1) * limit}`).then(response => {
                        // console.log(response);
                        response.data.map(code =>
                            caenCodes.push({ value: code.cod, label: code.cod + code.denumire })
                        );
                    });
                })
            ).then(() => {
                setCaenCodes(caenCodes);
            });
        });
    }, []);

    return (
        <Fragment>
            <div className="group-name">Identificare societate comerciala</div>
            <FormSuccess message={formSuccess.match(/^CUI/g) ? formSuccess : ''} />
            <FormErrors errors={formErrors['cui']} />
            <div className="row">
                <Text
                    label="Nume societate comerciala"
                    className="col-md-4"
                    name="company_data_nume"
                    validate={required}
                />
                <Text label={'CUI'} className="col-md-4" name="company_data_cui" validate={cui} />
                <div className="col-md-4">
                    <Button
                        secondary
                        fullWidth
                        value="Valideaza Cui"
                        // disabled={isLinkSent || isLoading}
                        onClick={() => onValidateClick('cui')}
                    />
                </div>
            </div>
            <div className="row">
                <Text
                    label="Telefon mobil firma"
                    className="col-md-4"
                    name="company_data_telefon_mobil"
                    validate={mix(required, tel)}
                />
                <Text
                    label={'Email firma'}
                    className="col-md-4"
                    name="company_data_email"
                    validate={mix(email, required)}
                />
            </div>
            <div className="row">
                <Text label={'Cod ONRC'} className="col-md-4" name="company_data_cod_onrc" />
                <FormErrors errors={formErrors['company_data_cod_onrc']} />
                <Select
                    label={'Cod CAEN'}
                    options={caenCodes}
                    className="col-md-4"
                    name="company_data_cod_caen"
                    validate={required}
                    autocomplete
                    // validate={caenCode}
                />
            </div>
            <div className="row">
                <Select
                    className="col-md-4"
                    label={'Tip societate'}
                    options={businessTypes}
                    name="company_data_tip_companie"
                    required={true}
                />
                <FormErrors errors={formErrors['company_data_tip_companie']} />
            </div>
        </Fragment>
    );
};

export default CompanyIdentification;
