import _ from 'lodash';

export const getFromForm = (formApi, prefix, sufix = '') => {
    let data = _.pickBy(
        formApi.getState().values,
        (value, key) => key.match(`^${prefix}`) && key.match(`${sufix}$`)
    );
    data = _.transform(data, (result, value, key) => {
        result[key.replace(prefix, '').replace(sufix, '')] = value;
    });
    return data;
};

export const addFormError = (component, context, error) => {
    return new Promise(resolve => {
        component.setState(
            {
                formErrors: {
                    ...component.state.formErrors,
                    [context]: [...(component.state.formErrors[context] || []), error],
                },
            },
            resolve
        );
    });
};

export const noFormErrors = component => {
    return _.isNil(_.find(component.state.formErrors, section => section.length > 0));
};

export const resetFormErrors = component => {
    return new Promise(resolve => {
        component.setState({ formErrors: component.formErrors }, resolve);
    });
};

export const checkForm = component => {
    return new Promise(resolve => {
        component.formApi.submitForm();
        component.setState({ isValid: !component.formApi.getState().invalid }, resolve);
    });
};

export const getCountyOptions = counties => {
    return _.map(counties, v => ({
        value: v.denumire,
        label: v.denumire,
    }));
};

export const getStreetTypeOptions = streetTypes => {
    return _.map(streetTypes, v => ({
        value: v.cod,
        label: v.cod,
    }));
};

export const getCityOptions = (formApi, cities, prefix, sufix = '') => {
    if (formApi) {
        const county = formApi.getState().values[`${prefix}judet${sufix}`];
        if (county) {
            return _.filter(cities, city => city.judet === county).map(item => ({
                value: item.internal_id,
                label: item.denumire,
            }));
        }
    }
    return [];
};

export const getStreetOptions = (formApi, cities, streets, prefix, sufix = '') => {
    if (formApi) {
        const cityId = formApi.getState().values[`${prefix}localitate${sufix}`];
        if (cityId) {
            const city = _.find(cities, item => item.internal_id === cityId);

            if (city) {
                return _.filter(streets, item => item.localitate === city.denumire).map(item => ({
                    value: item.internal_id,
                    label: item.denumire,
                }));
            }
        }
    }
    return [];
};
