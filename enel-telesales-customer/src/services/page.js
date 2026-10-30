class PageService {
    links = {};

    isMobile() {
        return window.innerWidth < 576;
    }
}

export default new PageService();
