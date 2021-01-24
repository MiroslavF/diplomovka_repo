const database = require('../database');
const config = require('../config');
const { cachingWrapper } = require('../utilities');

const networkTable = config.network.tableName;

async function calculateNodeCount() {
    const count = await database.raw(`
        select count(users.steam_id) from (
        select distinct a as steam_id from ${networkTable}
        union
        select distinct b as steam_id from ${networkTable}
        ) as users;
        `);
    return Number(Object.values(count[0][0])[0]);
}

module.exports = cachingWrapper(calculateNodeCount, 'node-count');
