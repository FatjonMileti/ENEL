import auth from 'services/auth';

export function login() {
    return async () => {
        await auth.fetchAccessToken();
    };
}

export function logout() {
    return async () => {
        await auth.deleteAccessToken();
        window.location = '/';
    };
}
