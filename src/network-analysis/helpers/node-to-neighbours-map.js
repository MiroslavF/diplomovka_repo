const database = require('../../database');
const config = require('../../config');
const { cachingWrapper } = require('../../utilities');

const networkTable = config.network.tableName;

async function calculateNodeToNeighboursMapEntries() {
    const edges = await database(networkTable).select('a', 'b');
    const nodeToNeighboursMap = new Map();
    for (let { a, b } of edges) {
        if (!nodeToNeighboursMap.has(a)) {
            nodeToNeighboursMap.set(a, []);
        }
        if (!nodeToNeighboursMap.has(b)) {
            nodeToNeighboursMap.set(b, []);
        }
        nodeToNeighboursMap.get(a).push(b)
        nodeToNeighboursMap.get(b).push(a)
    }
    return [...nodeToNeighboursMap];
}

async function calculateNodeToNeighboursMap() {
    const nodeToNeighboursMapEntries = await cachingWrapper(calculateNodeToNeighboursMapEntries, 'node-to-neighbours-map-entries')();
    return new Map(nodeToNeighboursMapEntries);
}

module.exports = calculateNodeToNeighboursMap;