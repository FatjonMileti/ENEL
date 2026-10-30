import React from 'react';
import PropTypes from 'prop-types';

import ConfirmOverlay from 'components/overlays/ConfirmOverlay';
import ModalOverlay from 'components/overlays/ModalOverlay';

const propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

const AgreementOverlay = ({ show, onClose, onConfirm }) => (
    <ModalOverlay
        show={show}
        onClose={onClose}
    >
        <ConfirmOverlay
            title="Prelucrarea datelor"
            description={
                (
                    <div>
                        Pentru a putea continua, avem nevoie de acordul dumneavoastră pentru prelucrarea datelor cu caracter personal (semnătură, nume, prenume, adresă, datele de identificare regăsite în actul de identitate, serie și număr carte de identitate, cod numeric personal), precum și pentru procesarea documentelor necesare (actul de identitate, factura de furnizare, respectiv dovada dreptului de proprietate și/sau de folosință a spațiului).
                        <br /><br />
                        În acest sens, menționăm că atât datele dumneavoastră cu caracter personal cât și documentele dumneavoastră vor fi prelucrate prin intermediul unui sistem de citire automată a informațiilor ca urmare a fotografierii documentelor necesare pentru încheierea contractului de furnizare.
                        <br /><br />
                        Informațiile din cadrul documentelor vor fi utilizate exclusiv în scopul încheierii și derulării relației contractuale, semnătura dumneavoastră captată prin prezentul acord urmând să fie utilizată și în cadrul procesului de schimbare furnizor, în scopul semnării notificării de schimbare furnizor, cât și în vederea încheierii contractului.
                        <br /><br />
                        * Ulterior semnării acestui acord și finalizării procesului de negociere a termenilor contractuali, veți primi un e-mail/SMS de confirmare la adresa indicată de dumneavoastră, ce va conține un link în care veți regăsi toate documentele ce vă vor fi prezentate în continuare.
                        <br /><br />
                        Contractul va fi considerat încheiat și activat doar după accesarea linkului primit și reconfirmarea conținutului documentelor prezentate în continuare. În cazul în care, procesul de încheiere și activarea a contractului nu este finalizat în termen de 90 de zile de la data primirii e-mail-ului/SMS-ului, documentele vor fi șterse.
                        <br /><br />
                        <b>Refuzul dumneavoastră pentru desfășurarea operațiunilor de prelucrare a datelor cu caracter personal și/sau de procesare a documentelor conduce la imposibilitatea derulării unei relații contractuale.</b>
                        <br />
                        <b>Înțeleg că semnătura olografă reprezintă o etapă prealabilă încheierii și executării unui contract și îmi exprim în mod voluntar acordul ca PPC să:</b>
                        <ul>
                            <li>Proceseze datele mele cu caracter personal și să rețină copii ale documentelor necesare pentru încheierea și executarea contractului de furnizare a energiei electrice și/sau a gazelor naturale și/sau pentru prestarea de către PPC a altor servicii conexe/similare detaliate în cadrul contractului;</li>
                            <li>Actualizeze datele mele cu caracter personal, dacă este cazul și doar dacă sunt deja client PPC;</li>
                            <li>Utilizeze și să aplice semnătura captată pe toate documentele necesare pentru încheierea și executarea contractului.</li>
                        </ul>
                        Sub sancțiunile aplicate faptei de fals în declarații prevăzute de Legea nr. 286/2009 privind Codul penal, cu modificările și completările ulterioare, declar pe propria răspundere faptul că datele cu caracter personal si documentele pe care urmează să le furnizez către PPC sunt complete și corecte în fiecare detaliu.
                        <br /><br /><br />
                        * prevederile marcate cu * se aplică doar pentru contractarea la distanță prin intermediul partenerilor de vânzări sau online.
                    </div>
                )
            }
            confirmLabel="Închide"
            onConfirm={onConfirm}
            noDismiss
            noLogo
            noFixed
            show
            big
        />
    </ModalOverlay>
);

AgreementOverlay.propTypes = propTypes;

export default AgreementOverlay;
