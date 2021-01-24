const database = require('../database');
const config = require('../config');
const { cachingWrapper } = require('../utilities');

const usersTable = config.steam.usersTable;
const edgesTable = config.network.tableName;

async function calculateNetworkEvolution() {
    let edgesDates = await database
        .select('since')
        .from(edgesTable)
        .whereNotNull('since');
    let usersDates = await database
        .select('since')
        .from(usersTable)
        .whereNotNull('since');

    edgesDates = edgesDates
        .sort(({ since: s1 }, { since: s2 }) => s1 - s2)
        .map(({ since }, index) => ({ since: new Date(since).getTime(), count: index + 1}));
    usersDates = usersDates
        .sort(({ since: s1 }, { since: s2 }) => s1 - s2)
        .map(({ since }, index) => ({ since: new Date(since).getTime(), count: index + 1}));
    return {
        edgesDates,
        usersDates,
    };
}
module.exports = cachingWrapper(calculateNetworkEvolution, 'network-evolution', 'steam-users');