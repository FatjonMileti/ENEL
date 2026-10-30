const { USER_ROLE } = require('../utils/enums.js');
const { API, ADMIN, MANAGER, AUDITOR, CM, AGENT, LA, LMA, LSA, LRA, BUM, USER, WEB,FSD_ADMIN } = USER_ROLE;

const permissions = Object.freeze({
    'session.find': [ADMIN,FSD_ADMIN, MANAGER, AUDITOR, CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'session.get': [ADMIN,FSD_ADMIN, MANAGER, AUDITOR, CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'session.create': [USER, WEB, CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'session.patch': [USER, WEB, CM, AGENT, LA, LMA, LSA, LRA, BUM, MANAGER],
    'session.multiPatch': [CM],
    'session.hash': [CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'session.gdpr': [ADMIN,FSD_ADMIN, AUDITOR, CM, AGENT, LA, LMA, LSA, LRA, BUM],

    'clientInfo.get': [USER, CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'clientInfo.create': [WEB, CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'clientInfo.session': [WEB],
    'clientInfo.directCROS': [CM, AGENT, LA, LMA, LSA, LRA, BUM],

    'excel.find': [ADMIN,FSD_ADMIN, MANAGER, AUDITOR, CM],
    'excel.detailed': [ADMIN,FSD_ADMIN, AUDITOR],
    'excelCharts.find': [ADMIN,FSD_ADMIN, AUDITOR],
    'logs.find': [ADMIN,FSD_ADMIN],
    'pingExcel.find': [ADMIN,FSD_ADMIN, MANAGER, AUDITOR, CM],
    'resetPassword.all': [ADMIN,FSD_ADMIN, CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'users.all': [ADMIN,FSD_ADMIN, MANAGER, AUDITOR, CM, AGENT, LA, LMA, LSA, BUM],
    'leads.create': [LA, LMA],
    //#region new API req
    'api.all': [API],
    //#endregion

    'offer.create': [USER, WEB, CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'sign.create': [USER, WEB, CM, AGENT, LA, LMA, LSA, LRA, BUM, MANAGER],

    'restoreSession.create': [CM, AGENT, LA, LMA, LSA, LRA, BUM],

    'mapList.method': [CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'gdprList.method': [CM, AGENT, LA, LMA, LSA, LRA, BUM],

    'app.androidApp1': [USER, MANAGER, CM],
    'app.cms':[ADMIN,FSD_ADMIN, MANAGER, AUDITOR, USER, API, CM],
    'app.webApp': [],
    'app.telesalesAgent': [CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'app.backofficeForm': [CM, AGENT, LA, LMA, LSA, LRA, BUM],

    'excelLeads.find': [LRA],

    'blacklist.find': [ADMIN,FSD_ADMIN, AUDITOR],
    'blacklist.create': [ADMIN,FSD_ADMIN, AUDITOR],
    'blacklist.remove': [ADMIN,FSD_ADMIN, AUDITOR],

    'whitelist.find': [ADMIN,FSD_ADMIN],
    'whitelist.create': [ADMIN,FSD_ADMIN],
    'whitelist.patch': [ADMIN,FSD_ADMIN],
    'whitelist.remove': [ADMIN,FSD_ADMIN],

});

const restrictions = Object.freeze({
    'session.companyId': [MANAGER, CM],
    'session.agentId': [AGENT, LA, LMA, LSA, LRA, BUM],
    'session.telesales': [CM, AGENT, LA, LMA, LSA, LRA, BUM],
    'restoreSession.agentId': [CM, AGENT, LA, LMA, LSA, LRA, BUM],

    'lead.details': [AGENT, BUM],

    'users.companyId': [MANAGER, CM],
});

exports.hasPermission = (role, action) => !!permissions[action].find(item => item == role);

exports.hasRestriction = (role, action) => !!restrictions[action].find(item => item == role);

exports.getPermissionRoles = (action) => permissions[action] || [];
