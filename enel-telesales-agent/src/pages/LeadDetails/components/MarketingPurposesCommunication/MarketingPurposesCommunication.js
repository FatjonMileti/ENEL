import React, { Fragment } from 'react';

import { Checkbox } from 'components/form';

const MarketingOptions = ({ formErrors, onStateCheckbox, ...props }) => {
    return (
        <Fragment>
            <div className="group-name">COMUNICARE IN SCOPURI DE MARKETING</div>
            <div className="row">
                <Checkbox
                    className="col-md-12"
                    name="contact_acord_mk"
                    label="SUNT DE ACORD să primesc de la PPC comunicări comerciale în scop de marketing direct care au legatură cu furnizarea de energie electrică şi/sau gaze naturale şi/sau alte bunuri și servicii dezvoltate de către PPC și/sau în colaborare cu parteneri ce pot include dar nu se limitează la produse și/sau servicii privind eficiența energetică, servicii de asistență și reparații instalații de utilități (electricitate, apă, gaz), precum și alte bunuri sau servicii complementare cu serviciile PPC."
                    onChange={onStateCheckbox}
                    disabled
                    black
                />
            </div>
            <div className="row">
                <Checkbox
                    className="col-md-12"
                    name="contact_acord_part"
                    label="SUNT DE ACORD ca datele mele de contact (nume prenume, email, telefon, adresă) să fie transmise către alte societăți din grupul PPC Advanced Energy Services Romania pentru a fi prelucrate în scop de marketing direct ce vizează produse electrice/electrocasnice, servicii de asistență și reparații instalații de utilități (electricitate, apă, gaz), precum și alte bunuri sau servicii complementare cu serviciile PPC. Mai multe detalii privind prelucrarea datelor cu caracter personal regăsiți accesând www.ppcenergy.ro"
                    onChange={onStateCheckbox}
                    disabled
                    black
                />
            </div>
            <div className="row">
                <Checkbox
                    className="col-md-12"
                    name="acord_profil"
                    label="SUNT DE ACORD să primesc de la PPC comunicări comerciale (marketing direct) personalizate în baza obiceiurilor de consum sau a preferințelor în utilizarea aplicațiilor puse la dispoziție de către PPC în urma creării de profiluri prin mijloace automate sau manuale"
                    onChange={onStateCheckbox}
                    disabled
                    black
                />
            </div>
        </Fragment>
    );
};

export default MarketingOptions;
