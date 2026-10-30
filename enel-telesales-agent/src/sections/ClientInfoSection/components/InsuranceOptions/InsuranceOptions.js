import React, { Fragment, useRef } from 'react';
import animateScrollTo from 'animated-scroll-to';

import ConfirmModal from 'components/modals/ConfirmModal';
import { Checkbox } from 'components/form';

const InsuranceOptions = ({
    isContractSent,
    isPlanSelected,
    session,
    insuranceErrorModal,
    onStateCheckbox,
}) => {
    const options = useRef(null);

    const handleModalConfirm = () => {
        animateScrollTo(options.current, {
            offset: -100,
            minDuration: 600,
        });
    };

    if (isPlanSelected) {
        const { ee_serviciu, gaz_serviciu } = session;
        let offer = ee_serviciu && ee_serviciu.tipOfertaAsigurat ? ee_serviciu : null;
        offer = gaz_serviciu && gaz_serviciu.tipOfertaAsigurat ? gaz_serviciu : offer;
        if (offer) {
            return (
                <Fragment>
                    <ConfirmModal
                        title="Preluare acord Generali"
                        description={
                            <div>
                                Este necesar acordul pentru prelucrarea datelor cu caracter personal
                                de catre Generali.
                                <br />
                                <br />
                                Este necesar acordul pentru prelucrarea datelor cu caracter personal
                                de către Generali.Pentru a beneficia de protecția împotriva
                                riscurilor acoperite de oferta {offer.denumire}, vă informăm că PPC
                                va transmite către Generali, în calitate de partener al Furnizorului
                                PPC, următoarele date cu caracter personal care vă aparțin: nume și
                                prenume, CNP, adresa locului de consum, adresa de e-mail, numărul de
                                telefon, codul Electel.
                                <br />
                                <br />
                                Aceste date se transmit în vederea efectuării de către Generali a
                                demersurilor pentru încheierea și executarea contractului de
                                asigurare, pentru emiterea și transmiterea către dumneavoastră a
                                Certificatului de asigurare sau, după caz, reînnoirea acestuia. În
                                cazul în care nu agreați transmiterea acestor date către Generali,
                                vă aducem la cunoștință că:
                                <ul className="unordered-list">
                                    <li>
                                        {' '}
                                        fără a avea la dispoziție datele dumneavoastră cu caracter
                                        personal, necesare executării contractului de asigurare,{' '}
                                    </li>
                                    <li>
                                        {' '}
                                        fară a avea documente ce conțin date cu caracter personal
                                        pentru gestionarea cererilor dumneavoastră de acordarea de
                                        despăgubiri în baza beneficiului conferit de contract
                                        încheiat cu furnizorul PPC,
                                    </li>
                                </ul>
                                Generali nu va putea să încheie sau, după caz, nu va putea executa
                                condițiile aferente certificatului de asigurare - beneficiu aferent
                                ofertei {offer.denumire} și astfel nu veți putea beneficia de
                                protecția acordată prin intermediul acestui produs.
                            </div>
                        }
                        ref={insuranceErrorModal}
                        confirmLabel="Inchide"
                        onConfirm={handleModalConfirm}
                    />
                    <div className="group-name" ref={options}>
                        Prelucrarea datelor cu caracter personal și comunicare electronică cu
                        Generali România
                    </div>
                    <div className="text-extra">
                        <div className="col-md-12">
                            Mai multe detalii privind produsul de asigurare și prelucrarea datelor
                            cu caracter personal în cadrul derulării contractului pentru produsul{' '}
                            {offer.denumire} găsiți{' '}
                            <a
                                href="https://www.generali.ro/enel/enel-protect"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                aici
                            </a>
                        </div>
                    </div>
                    <div className="row">
                        <Checkbox
                            className="col-md-12"
                            name="contact_acord_protect"
                            onChange={onStateCheckbox}
                            disabled={isContractSent}
                            label={
                                <span>
                                    Ținând cont de specificul asigurării de care voi beneficia, sunt
                                    în mod expres de acord ca Generali să prelucreze{' '}
                                    <b>DATELE MELE PRIVIND PRIVIND STAREA DE SĂNĂTATE,</b> date
                                    absolut necesare pentru prestarea acestor servicii de asigurare
                                    specifice.
                                    <b>Sunt, de asemenea, de acord </b>să împuternicesc Generali să
                                    întreprindă orice fel de investigații, să ceară documente
                                    medicilor curanți, care pot duce la evaluarea completă a stării
                                    mele de sănătate. În acest scop orice medic, spital,
                                    policlinica, sau orice alta instituție medicală sau persoană
                                    care deține date sau informații și/sau documente despre starea
                                    mea de sănătate să furnizeze, la solicitarea scrisă a Generali,
                                    informații complete, referitoare la orice boală, accident,
                                    tratament, examinare, consultație, spitalizare etc pe care am
                                    efectuat-o. În cazul producerii unui Eveniment / Risc asigurat,
                                    împuternicesc Generali să facă toate demersurile pentru
                                    obținerea documentelor necesare stabilirii întinderii obligației
                                    de plată a despabubirii, eliberând de secretul profesional atât
                                    pe medicii care m-au consultat / tratat, cât și orice Insitutie
                                    publică sau privată care deține informații cu privire la starea
                                    mea de sănătate și la istoricul meu medical, atât în timpul
                                    vieții, cât și ulterior, în situația producerii riscului de
                                    Deces din orice cauză. Am înțeles că, dacă nu îmi voi exprima
                                    acordul pentru prelucrarea datelor privind starea de sănătate,
                                    Generali nu va putea executa contractul de asigurare în care
                                    sunt parte sau ale cărui efecte se produc față de mine, inclusiv
                                    dar fară a se limita la activitatea de plată a despăgubirilor.
                                </span>
                            }
                        />
                    </div>
                    <div className="row">
                        <Checkbox
                            className="col-md-12"
                            name="contact_acord_mkt_generali"
                            onChange={onStateCheckbox}
                            disabled={isContractSent}
                            label={
                                <span>
                                    <b>Sunt în mod expres de acord </b> să mi se comunice și să
                                    primesc de la Generali informări despre serviciile și produsele
                                    sale, inclusiv pentru imbunatirea acestora, beneficii pe care să
                                    le accesez, oferte promoționale sau oportunități de asigurare
                                    (SCOP DE MARKETING).
                                </span>
                            }
                        />
                    </div>
                    <div className="group-name" ref={options}>
                        INFORMAREA ASIGURATORULUI PRIVIND CUNOAȘTEREA CLIENTELEI
                    </div>
                    <div className="row">
                        <Checkbox
                            className="col-md-12"
                            name="contact_pers_publica_generali"
                            onChange={onStateCheckbox}
                            disabled={isContractSent}
                            label={
                                <span>
                                    <b>Sunt persoană expusă public</b> SAU membru al familiei unei
                                    persoane expuse public SAU asociat apropiat al unei persoane
                                    expuse public, în acord cu Legea 129/2019 pentru prevenirea şi
                                    combaterea spălării banilor şi finanţării terorismului și cu
                                    Norma de aplicare. <b>EXPLICAȚII:</b> Prin persoane expuse
                                    public se înțeleg persoanele fizice care exercită sau au
                                    exercitat funcții publice importante (inclusiv la nivel
                                    comunitar sau internațional). După împlinirea unui termen de un
                                    an de la data la care persoana expusă public a încetat să mai
                                    ocupe funcția publică importantă respectivă, nu se mai supune
                                    obligației de informare de mai sus nici ea, nici membrii
                                    familiei și nici asociații apropiați.
                                </span>
                            }
                        />
                    </div>
                    <div className="group-name" ref={options}>
                        ACORDUL PERSOANEI PROPUSE SPRE ASIGURARE PRIVIND INCLUDEREA ÎN ASIGURAREA DE
                        GRUP
                    </div>
                    <div className="text-extra">
                        <div className="col-md-12">
                            Prin apăsarea butonui CONTINUĂ sunt în mod expres de acord cu încheierea
                            asigurării (a Contractului de asigurare) pentru următoarele riscuri:
                            <ul className="unordered-list">
                                <li> Pierderea Involuntară a Locului de Muncă (Șomaj),</li>
                                <li> Invaliditatea Permanentă Totală din orice cauză și</li>
                                <li>
                                    {' '}
                                    Deces din orice cauză, ca beneficiu gratuit oferit de PPC
                                    Energie parte din pachetul {offer.denumire}.
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* <div className="row">
                        <Checkbox
                            className="col-md-12"
                            name="annex"
                            label={
                                <span>
                                    Declar că AM PRIMIT ȘI AM ÎNȚELES 1(un) exemplar al Anexei
                                    intitulată{' '}
                                    <a
                                        href="https://www.generali.ro/wp-content/uploads/2019/04/Anexa-1-bis-Informare_Clienti_Transfer-date-Generali_site-Generali.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        "Informare privind prelucrarea datelor cu caracter personal
                                        în cadrul derulării contractului pentru produsul{' '}
                                        {offer.denumire}"
                                    </a>
                                    .
                                </span>
                            }
                        />
                    </div> */}
                </Fragment>
            );
        }
    }

    return null;
};

export default InsuranceOptions;
