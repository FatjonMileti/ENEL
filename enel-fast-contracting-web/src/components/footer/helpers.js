export const initEmbeddedChat = () => {
    const initESW = function (gslbBaseURL) {
        window.embedded_svc.settings.displayHelpButton = true; // Or false
        window.embedded_svc.settings.language = 'ro'; // For example, enter 'en' or 'en-US'
        window.embedded_svc.settings.defaultMinimizedText = 'Discuta cu un consultant'; // (Defaults to Chat with an Expert)
        window.embedded_svc.settings.disabledMinimizedText = 'Consultant offline'; // (Defaults to Agent Offline)
        window.embedded_svc.settings.loadingText = 'Se Incarca'; // (Defaults to Loading)
        // embedded_svc.settings.storageDomain = 'yourdomain.com'; //(Sets the domain for your deployment so that visitors can navigate subdomains during a chat session)
        // Settings for Chat
        // embedded_svc.settings.directToButtonRouting = function(prechatFormData) {
        // Dynamically changes the button ID based on what the visitor enters in the pre-chat form.
        // Returns a valid button ID.
        // };
        // embedded_svc.settings.prepopulatedPrechatFields = {}; //Sets the auto-population of pre-chat form fields
        // embedded_svc.settings.fallbackRouting = []; //An array of button IDs, user IDs, or userId_buttonId
        // embedded_svc.settings.offlineSupportMinimizedText = '...'; //(Defaults to Contact Us)
        window.embedded_svc.settings.enabledFeatures = ['LiveAgent'];
        window.embedded_svc.settings.entryFeature = 'LiveAgent';
        window.embedded_svc.init(
            'https://mro-crm.my.salesforce.com',
            'https://mro-crm.secure.force.com/livechat',
            gslbBaseURL,
            '00D1t000000ww6o',
            'Live_Agent_Embedded_Deployment',
            {
                baseLiveAgentContentURL: 'https://c.la1-c2-fra.salesforceliveagent.com/content',
                deploymentId: '5723Y000000kDDk',
                buttonId: '5733Y000000kD43',
                baseLiveAgentURL: 'https://d.la1-c2-fra.salesforceliveagent.com/chat',
                eswLiveAgentDevName: 'EmbeddedServiceLiveAgent_Parent04I3Y000000fxfLUAQ_17be8ec6d6f',
                isOfflineSupportEnabled: false,
            }
        );
        window.embedded_svc.settings.targetElement = document.getElementById('embeddedChatContainer');
    };
    if (!window.embedded_svc) {
        const s = document.createElement('script');
        s.setAttribute('src', 'https://mro-crm.my.salesforce.com/embeddedservice/5.0/esw.min.js');
        s.onload = function () {
            initESW(null);
        };
        document.body.appendChild(s);
    } else {
        initESW('https://service.force.com');
    }
};
