const config = {
    env: process.env.NODE_ENV || 'development',
    GOOGLE_MAPS_KEY: 'AIzaSyCeakPZvC-Q7-jHSiYJZ-fUbX3QMhGkA3A',
    URL: process.env.REACT_URL,
    API_URL: process.env.REACT_API_URL,
    CRM_URL: process.env.REACT_CRM_URL,
    OCR_URL: process.env.REACT_OCR_URL,
    RECAPTCHA_KEY: process.env.REACT_RECAPTCHA_KEY,
    CAMPAIGNS_CHANNEL: process.env.REACT_CAMPAIGNS_CHANNEL,
    CAMPAIGNS_SEGMENT: process.env.REACT_CAMPAIGNS_SEGMENT,
    MOCK_API: process.env.REACT_MOCK_API,
    WEB_APP: process.env.REACT_WEB_APP,
};

config.PUBLIC_URL = config.URL;
config.SERVER_URL = config.API_URL;
config.API_ENDPOINT = `${config.API_URL}/api`;
config.AUTH_ENDPOINT = `${config.URL}/api`;

module.exports = config;
