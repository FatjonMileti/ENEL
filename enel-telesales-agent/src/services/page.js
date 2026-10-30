import animateScrollTo from 'animated-scroll-to';

class PageService {
    links = {
        login: 'login',
        searchPlace: 'searchPlace',
        searchData: 'searchData',
        resetPassword: 'resetPassword',
        sessionList: 'overview',
        sessionDetails: 'details',
        leadsList: 'leads',
        leadDetails: 'leads/:id',
        sendOffer: 'sendOffer',
        sessionEdit: 'sessions/:id/:hash',
    };

    scrollToError = () => {
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
            const error =
                document.querySelector('.has-error') || document.querySelector('.FormErrors');
            if (error) {
                animateScrollTo(error, { offset: -400 });
            }
        }, 100);
    };

    isMobile() {
        return window.innerWidth < 576;
    }
}

export default new PageService();
