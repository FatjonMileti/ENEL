export const getItemsByLeadId = state => leadId => {
    return state.leadLogs.itemsByLeadId[`_${leadId}`];
};
