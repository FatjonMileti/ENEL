import { LOGIN_INFO, EVENTS, PAGE_INFO } from '../utils/constants/adobe_analytics';

class AdobeAnalytics {
    pageLoad(eventType = EVENTS.pageLoad) {
        const event = {
            event: eventType,
            pageInfo: {
                pageType: 'home',
                language: 'ro',
            },
        };
        this.pushEvent(event);
    }

    /**
     *
     * @param {offerCategory, offerName, offerType, offerUsage} offer
     */
    offerClicked(offer) {
        const eventType = EVENTS.clickOffer;
        const event = {
            event: eventType,
            loginInfo: LOGIN_INFO,
            offerInfo: [offer],
        };
        this.pushEvent(event);
    }

    countrySelected(provider, offer, sessionId) {
        const eventType = EVENTS.subscriptionFormsStep0a;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:county choice';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'county choice';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                processID: sessionId,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    offerList(provider, offer, sessionId) {
        const eventType = EVENTS.subscriptionFormsStep0b;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:offer list';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'offer list';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                processID: sessionId,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }
    subscriptionFormStep1(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');
        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet,
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const eventType = EVENTS.subscriptionFormStep1;
        const pageInfo = PAGE_INFO;
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:personal data treatment';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'personal data treatment';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                processID: sessionId,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }
    subscriptionFormStep2(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');
        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const eventType = EVENTS.subscriptionFormStep2;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:supply contract';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'supply contract';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                processID: sessionId,
                // currentProvider: 'n.a.',
                // currentHolder: 'n.a.',
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep3(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep3;
        const pageInfo = { ...PAGE_INFO };
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:upload identity document';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'upload identity document';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep3a(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep3a;
        const pageInfo = { ...PAGE_INFO };
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:upload company document';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'upload company document';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep3b(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep3b;
        const pageInfo = { ...PAGE_INFO };
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:upload identity document';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'upload identity document';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep4(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');
        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep4;
        const pageInfo = { ...PAGE_INFO };

        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:cnp confirmation';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'cnp confirmation';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                // existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }


    subscriptionFormStep4B(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');
        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep4;
        const pageInfo = { ...PAGE_INFO };

        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:cui confirmation';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'cui confirmation';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                // existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep5(session) {

        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep5;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:personal data compilation';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'personal data compilation';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep6(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep6;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:bill upload';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'bill upload';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep7(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const eventType = EVENTS.subscriptionFormStep7;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:check pod/clc';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'check pod/clc';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep8(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        const eventType = EVENTS.subscriptionFormStep8;
        const pageInfo = PAGE_INFO;
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:bill details';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'bill details';
        pageInfo.level3 = '';
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        pageInfo.provider = provider;
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep9(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        const eventType = EVENTS.subscriptionFormStep9;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:upload bill documents';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'upload bill documents';
        pageInfo.level3 = '';
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        pageInfo.provider = provider;
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep10(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        const eventType = EVENTS.subscriptionFormStep10;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:type bill';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'type bill';
        pageInfo.level3 = '';
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        pageInfo.provider = provider;
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep11(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        const eventType = EVENTS.subscriptionFormStep11;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:contract transmission';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'contract transmission';
        pageInfo.level3 = '';
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        pageInfo.provider = provider;
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const client = session.gaz_contact || session.ee_contact;

        // const waySendingBill = (client.canal_sms || client.canal_email) ? (client.canal_email ? 'email' : 'sms') : '';
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
                // waySendingBill,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep12a(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum ? (session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')))) : (session.ee_loc && session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : '');

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or residential
            offerCounty: session.judet, //
            annualConsumption,
        };
        const eventType = EVENTS.subscriptionFormStep12a;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:stipulated contract';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'stipulated contract';
        pageInfo.level3 = '';
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        pageInfo.provider = provider;
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const invoice = session.ee_factura || gaz_factura;
        const waySendingBill = invoice ? (invoice.mod_corespondenta == 'POSTA' ? 'at home' : (invoice.mod_corespondenta == 'MAIL' ? 'email' : 'sms')) : '';
        // const sendingVia = invoice ? (invoice.mod_corespondenta == 'POSTA' ? 'posta' : (invoice.mod_corespondenta == 'MAIL' ? 'email' : 'sms')) : '';
        // pageInfo.level3 = '';
        // pageInfo.level3 = `via ${sendingVia}`;
        // pageInfo.pageName = 'subscription form:stipulated contract';
        // pageInfo.pageName = `subscription form:stipulated contract:${pageInfo.level3}`;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                activeSupply: subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
                waySendingBill,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStep12b(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = session.ee_consum.length > 0 ? (session.ee_consum[0].anual) : (session.gaz_consum.length > 0 ? session.gaz_consum[0].anual : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')));

        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: session.contract_type === 'b2c' ? 'residential' : 'business', // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        const eventType = EVENTS.subscriptionFormStep12b;
        const pageInfo = { ...PAGE_INFO };
        const currentProvider = (session.ee_loc || session.gaz_loc).furnizor_id;
        pageInfo.pageType = 'subscription form';
        pageInfo.pageName = 'subscription form:contract confirmation';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'contract confirmation';
        pageInfo.level3 = '';
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        pageInfo.provider = provider;
        const sessionId = session.id;
        const subscriptionChoice = (session.ee_are_furnizare_activa || session.gaz_are_furnizare_activa) ? 'yes, I have a supply contract' : 'no, I don\'t have a supply contract';
        const existedClient = session.backoffice ? 'no' : 'yes';
        const currentHolder = (session.ee_schimba_titular || session.gaz_schimba_titular) ? 'yes, I change the holder' : 'no, I don\'t change';
        const invoice = session.ee_factura || gaz_factura;
        const waySendingBill = invoice ? (invoice.mod_corespondenta == 'POSTA' ? 'at home' : (invoice.mod_corespondenta == 'MAIL' ? 'email' : 'sms')) : '';
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                subscriptionChoice,
                processID: sessionId,
                currentProvider,
                currentHolder,
                existedClient,
                waySendingBill,
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFormStepQuitProcess(session) {
        const serviciu = session.ee_serviciu || session.gaz_serviciu;
        const annualConsumption = (session.ee_consum) ? (session.ee_consum.length > 0 ? session.ee_consum[0].anual : '') : (session.gaz_consum ? (session.gaz_consum[0].anual ? session.gaz_consum[0].anual : '') : (session.ee_loc.cantitate_anuala ? session.ee_loc.cantitate_anuala : (session.gaz_loc.cantitate_anuala ? session.gaz_loc.cantitate_anuala : '')));
        const offer = {
            offerCategory: serviciu.cod,
            offerName: serviciu.denumire,
            offerType: serviciu.serviciu !== 'EE' ? 'natural gas' : 'electricity',
            offerUsage: serviciu.seg.toLowerCase(), // business or
            offerCounty: session.judet, //
            annualConsumption,
        };
        let provider = '';
        if (['ILFOV', 'BUCURESTI', 'GIURGIU'].includes(session.judet)) {
            provider = 'enel energie muntenia sa';
        } else {
            provider = 'enel energie sa';
        }
        const sessionId = session.id;
        const eventType = EVENTS.subscriptionFormStepQuitProcess;
        const pageInfo = { ...PAGE_INFO };
        pageInfo.pageType = 'quit process';
        pageInfo.pageName = 'subscription form:quit contracting process';
        pageInfo.level1 = 'subscription form';
        pageInfo.level2 = 'quit contracting process';
        pageInfo.level3 = '';
        pageInfo.provider = provider;
        const offerInfo = [offer];
        const event = {
            event: eventType,
            subscriptionInfo: {
                processID: sessionId,
                currentProvider: 'n.a.',
                currentHolder: 'n.a.',
            },
            pageInfo,
            offerInfo,

        };
        this.pushEvent(event, true);
    }

    subscriptionFromStepReportProblemOK(answer, sessionId) {
        const eventType = EVENTS.subscriptionFormStepReportProblemOK;
        const event = {
            event: eventType,
            subscriptionInfo: {
                processId: sessionId,
                userReporting: answer,
            },
        };
        this.pushEvent(event);
    }

    subscriptionFromStepReportProblem(sessionId) {
        const eventType = EVENTS.subscriptionFormReportProblem;
        const event = {
            event: eventType,
        };
        this.pushEvent(event);
    }

    subscriptionFormKO(reason) {
        const eventType = EVENTS.subscriptionFormKO;
        const event = {
            event: eventType,
            failureInfo: {
                koReason: reason,
            },

        };
        this.pushEvent(event);
    }

    pushEvent(event, withLoginInfo) {
        if (!event['loginInfo'] && withLoginInfo) {
            event['loginInfo'] = LOGIN_INFO;
        }
        window.adobeDataLayer.push(event);
    }

}

export default new AdobeAnalytics();
