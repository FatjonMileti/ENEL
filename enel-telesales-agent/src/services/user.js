export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
    AUDITOR: 'auditor',
    WEB: 'web',
    CM: 'cm', // Contract Manager
    AGENT: 'agent',
    LA: 'la', // Leads Admin
    LMA: 'lma', // Leads Marketing Admin
    LSA: 'lsa', // Leads Sales Admin
    LRA: 'lra', // Leads Reports Admin
    BUM: 'bum', // Business Unit Manager
};

export const isTS = user => user.role === ROLES.AGENT && user.type === 'pe';
