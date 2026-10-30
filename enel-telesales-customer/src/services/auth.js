import http from './http';
import { sleep } from '../utils';

const LIFETIME = 7 * 24 * 3600 * 1000; // 1 week
const OPTIONS = {
    clientid: process.env.REACT_APP_WEB_APP,
    clientsecret: process.env.REACT_APP_SECRET,
    'x-api-key': process.env.REACT_APP_WEB_APP,
};
const API_URL = process.env.REACT_APP_API_URL;

class AuthService {
    // True is one of the requests is in the process
    // of refreshing the token
    refreshingAccessToken = false;

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

    // Retrieve access token from local storage
    // and refresh if older than LIFETIME
    async getAccessToken() {
        if (this.refreshingAccessToken) {
            await sleep(100);
            return this.getAccessToken();
        }

        let accessToken = this.getLocalAccessToken();
        if (
            !accessToken.timestamp ||
            Date.now() - accessToken.timestamp > LIFETIME
        ) {
            this.refreshingAccessToken = true;
            const value = await this.fetchAccessToken();
            this.setLocalAccessToken(value);
            this.refreshingAccessToken = false;

            accessToken = this.getLocalAccessToken();
        }

        return accessToken;
    }

    // Retrieve access token from Auth Server
    async fetchAccessToken() {
        const url = `${API_URL}/authentication`;
        const [response, data] = await http.post(url, {}, OPTIONS);
        this.setLocalAccessToken(data.accessToken);

        return data.accessToken;
    }

    // Delete access token from local storage
    async deleteAccessToken() {
        this.setLocalAccessToken('');
    }
}

export default new AuthService();
