export const ENERGY_TYPE = {
    ELECTRICA: 'ELECTRICA',
    GAZE_NATURALE: 'GAZE NATURALE',
};

export const CLIENT_TYPE = {
    // CONTRACT_PERSOANA_FIZICA: 'CONTRACT PERSOANA FIZICA',
    CONTRACT_FIRMA: 'CONTRACT FIRMA',
};

export const ENERGY_CLIENT_TYPE = {
    CASNIC: 'CASNIC',
    NONCASNIC: 'NONCASNIC',
};

export const ENERGY_ANNUAL_ESTIMATION = {
    ELECTRICA: {
        SOHO: 'mai mic de 50.000 KWh/an',
        MICRO: 'intre 50.000 KWh/an- 200.000KWh/an',
        SMALL: 'intre 200.000 KWh/an-1.000.000KWh/an',
        BIG: 'peste 1.000.000KWh/an',
    },
    GAZE_NATURALE: {
        SMALL: 'mai mic de 280.000 KWh/an',
        MEDIUM: 'intre 280.000 KWh/an- 2.800.000KWh/an',
        BIG: 'peste 2.800.000KWh/an',
    },
};
