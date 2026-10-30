export const toPatchSessionData = (form) => {
    const {lastName, firstName, clientEmail, clientPhoneNumber, companyName, companyTelefon, companyEmail, companyRepresentativeName, companyRepresentativeLastame} = form;

    const data = {
        // tip_client: 'CAS',
    };

    if (companyName) {
        data.company = {
            data: {
                nume: companyName && companyName.trim(),
                telefon_mobil: companyTelefon && companyTelefon.trim(),
                email: companyEmail && companyEmail.trim()
            },
            legal_representative: {
                prenume: companyRepresentativeName && companyRepresentativeName.trim(),
                nume: companyRepresentativeLastame && companyRepresentativeLastame.trim(),
            }
        };
    } else {
        data.nume = lastName && lastName.trim();
        data.prenume = firstName && firstName.trim();
        data.client = {
            email: clientEmail && clientEmail.trim(),
            telefon_mobil: clientPhoneNumber && clientPhoneNumber.trim()
        }
    }

    return data;
};
