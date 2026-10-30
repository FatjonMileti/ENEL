import _ from 'lodash';
import pageService from 'services/page';
import { isBackoffice } from 'store/session/selectors';
import { getFlow } from 'store/client/selectors';

export function isLoading(state) {
    return state.ui.loading;
}

export function getRedirect(state) {
    return state.ui.redirectTo;
}

export function getTotalSteps(state, flow) {
    if (!flow) {
        flow = getFlow(state).toLowerCase();
    }

    let { totalSteps } = state.ui;

    if (isBackoffice(state)) totalSteps--;
    if (state.ui[`${flow}HideClientPlaceDocs`]) totalSteps--;

    return parseInt(totalSteps);
}

export function getCurrentStep(state, flow) {
    if (!flow) {
        flow = getFlow(state).toLowerCase();
    }
    let path = window.location.pathname.replace('/', '');
    path = path.split('#');
    let step = pageService.getStepFromPage(path[0]) - 2;

    if (state.ui[`${flow}HideClientPlaceDocs`] && step > 9) step--;

    return parseInt(step);
}

export function getTotalComboSteps(state) {
    return getTotalSteps(state, 'ee') + getTotalSteps(state, 'gaz') - 5;
}

export function getCurrentComboStep(state) {
    const flow = getFlow(state).toLowerCase();
    if (flow === 'ee') {
        return getCurrentStep(state, 'ee');
    }

    return getTotalSteps(state, 'ee') + getCurrentStep(state, 'gaz') - 5;
}
