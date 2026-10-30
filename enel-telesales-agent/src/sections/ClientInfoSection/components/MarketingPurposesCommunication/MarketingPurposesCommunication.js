import React, { Fragment } from 'react';

import { FormErrors } from 'components/form';
import CheckboxControlled from 'components/form/CheckboxControlled';

const MarketingOptions = ({
    isLinkSent,
    formErrors,
    onStateCheckbox,
    handleMarketingAgreeCheckBox,
    handleMarketingDisagreeCheckBox,
    handleMarketingContactDataAgreeCheckBox,
    handleMarketingContactDataDisagreeCheckBox,
    handleMarketingProfileaAgreeCheckBox,
    handleMarketingProfileDisagreeCheckBox,
    contact_acord_mk,
    contact_acord_part,
    contact_acord_profil,
    ...props
}) => {
    return (
        <Fragment>
            <div className="group-name">COMUNICARE IN SCOPURI DE MARKETING</div>
            <FormErrors errors={formErrors['channel']} />
            <div className="row">
                <div className="col-md-4">
                    <CheckboxControlled
                        name="contact_acord_mk"
                        label="SUNT DE ACORD"
                        onChange={handleMarketingAgreeCheckBox}
                        // disabled={isLinkSent}
                        checked={contact_acord_mk === undefined ? false : contact_acord_mk}
                    />
                    <CheckboxControlled
                        name="contact_acord_mk_disagree"
                        label="NU SUNT DE ACORD"
                        onChange={handleMarketingDisagreeCheckBox}
                        // disabled={isLinkSent}
                        checked={contact_acord_mk === undefined ? false : !contact_acord_mk}
                    />
                </div>
                <div className="col-md-8">
                    <p>
                        să primesc de la PPC comunicări comerciale în scop de marketing direct care
                        au legatură cu furnizarea de energie electrică şi/sau gaze naturale şi/sau
                        alte bunuri și servicii dezvoltate de către PPC și/sau în colaborare cu
                        parteneri ce pot include dar nu se limitează la produse și/sau servicii
                        privind eficiența energetică, servicii de asistență și reparații instalații
                        de utilități (electricitate, apă, gaz), precum și alte bunuri sau servicii
                        complementare cu serviciile PPC.
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <CheckboxControlled
                        name="contact_acord_part"
                        label="SUNT DE ACORD"
                        onChange={handleMarketingContactDataAgreeCheckBox}
                        // disabled={isLinkSent}
                        checked={contact_acord_part === undefined ? false : contact_acord_part}
                    />
                    <CheckboxControlled
                        name="contact_acord_part_disagree"
                        label="NU SUNT DE ACORD"
                        onChange={handleMarketingContactDataDisagreeCheckBox}
                        // disabled={isLinkSent}
                        checked={contact_acord_part === undefined ? false : !contact_acord_part}
                    />
                </div>
                <div className="col-md-8">
                    <p>
                        ca datele mele de contact (nume prenume, email, telefon, adresă) să fie
                        transmise către alte societăți din grupul PPC Advanced Energy Services
                        Romania pentru a fi prelucrate în scop de marketing direct ce vizează
                        produse electrice/electrocasnice, servicii de asistență și reparații
                        instalații de utilități (electricitate, apă, gaz), precum și alte bunuri sau
                        servicii complementare cu serviciile PPC. Mai multe detalii privind
                        prelucrarea datelor cu caracter personal regăsiți accesând www.ppcenergy.ro
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <CheckboxControlled
                        name="contact_acord_profil"
                        label="SUNT DE ACORD"
                        onChange={handleMarketingProfileaAgreeCheckBox}
                        // disabled={isLinkSent}
                        checked={contact_acord_profil === undefined ? false : contact_acord_profil}
                    />
                    <CheckboxControlled
                        name="contact_acord_profil_disagree"
                        label="NU SUNT DE ACORD"
                        onChange={handleMarketingProfileDisagreeCheckBox}
                        // disabled={isLinkSent}
                        checked={contact_acord_profil === undefined ? false : !contact_acord_profil}
                    />
                </div>
                <div className="col-md-8">
                    <p>
                        să primesc de la PPC comunicări comerciale (marketing direct) personalizate
                        în baza obiceiurilor de consum sau a preferințelor în utilizarea
                        aplicațiilor puse la dispoziție de către PPC în urma creării de profiluri
                        prin mijloace automate sau manuale
                    </p>
                </div>
            </div>
        </Fragment>
    );
};

export default MarketingOptions;
