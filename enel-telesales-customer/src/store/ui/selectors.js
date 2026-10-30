import _ from 'lodash';

export const isLoading = state => {
    return state.ui.loading;
};

export const isDocLoading = state => (flow, docType) => {
    const { docLoading } = state.ui;
    if (flow && docType) {
        return docLoading[flow][docType];
    }

    return !!_.find(docLoading.ee, item => item) || !!_.find(docLoading.gaz, item => item);
};
