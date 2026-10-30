const { authenticate } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-hooks-common');

function groupByCodAndCombo(arr, output) {
    if (arr.length === 0) return;

    let group = [];
    let actual = arr.pop();
    group.push(actual);

    for (let i = arr.length - 1; i >= 0; i--) {
        if (actual.combo === arr[i].cod) {
            group.push(arr[i]);
            arr.splice(i, 1);
        }
    }

    output.push(group);

    //going recursive
    groupByCodAndCombo(arr, output);
}

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [],
        get: [hooks.disallow('external')],
        create: [hooks.disallow('external')],
        update: [hooks.disallow('external')],
        patch: [hooks.disallow('external')],
        remove: [hooks.disallow('external')]
    },

    after: {
        all: [],
        find: [
            async context => {
                context.result.variantePreturi.forEach(offer => {
                    offer.tipOfertaAsigurat = !!(offer.tip && offer.tip.toLowerCase().match('protect'));
                });

                if (context.params.query.serviciu === 'COMBO' && !context.params.query.disableComboGroup) {
                    // Group packages by COMBO
                    let comboArray = context.result.variantePreturi;
                    let output = [];
                    groupByCodAndCombo(comboArray, output);
                    context.result = output;
                }
            }
        ],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
