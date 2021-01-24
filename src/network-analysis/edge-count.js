const database = require('../database');
const config = require('../config');
const { cachingWrapper } = require('../utilities');

const networkTable = config.network.tableName;

async function calculateEdgeCount() {
    const count = await database(networkTable).count('a');
    return Number(Object.values(count[0])[0]);
}

module.exports = cachingWrapper(calculateEdgeCount, 'edge-count');