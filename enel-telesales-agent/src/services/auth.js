import http from './http';

const API_URL = process.env.REACT_APP_API_URL;
const LIFETIME = 24 * 3600 * 1000; // 1 day
const OPTIONS = {
    clientid: process.env.REACT_APP_KEY,
    clientsecret: process.env.REACT_APP_SECRET,
    'x-api-key': process.env.REACT_APP_KEY,
};

class AuthService {
    // Retrieve access token from local storage
    getLocalAccessToken = () => {
        try {
            if (localStorage.getItem('accessToken')) {
                return JSON.parse(localStorage.getItem('accessToken'));
            }
            return {
                value: '',
                timestamp: null,
            };
        } catch (e) {
            return {
                value: '',
                timestamp: null,
            };
        }
    };

    // Save access token to local storage
    setLocalAccessToken = value => {
        const accessToken = {
            value,
            timestamp: Date.now(),
        };
        localStorage.setItem('accessToken', JSON.stringify(accessToken));
    };

    // Get access token or delete it if it's expired
    async getAccessToken() {
        let accessToken = this.getLocalAccessToken();
        if (!this.isValidAccessToken()) {
            this.deleteAccessToken();
            window.location = '/login';
        }

        return accessToken;
    }

    isValidAccessToken() {
        let accessToken = this.getLocalAccessToken();
        return !!(
            accessToken.value &&
            accessToken.timestamp &&
            Date.now() - accessToken.timestamp < LIFETIME
        );
    }

    // Retrieve access token from Auth Server
    async fetchAccessToken(username, password, code, pin) {
        const url = `${API_URL}/authentication`;
        const recaptcha = `${API_URL}/recaptcha`;

        if (!pin) {
            const [response, data] = await http.post(recaptcha, { marca: username, token: code });

            if (!response.ok) {
                throw new Error('INVALID_LOGIN');
            }

            this.setLocalAccessToken(data.accessToken);
            return data.accessToken;
        } else {
            const [response, data] = await http.post(
                url,
                { marca: username, password, code, strategy: 'client', pin, ts: true },
                OPTIONS
            );
            if (!response.ok) {
                throw new Error('INVALID_LOGIN');
            }

            this.setLocalAccessToken(data.accessToken);
            return data.accessToken;
        }
    }

    // Delete access token from local storage
    async deleteAccessToken() {
        this.setLocalAccessToken('');
    }
}

export default new AuthService();
