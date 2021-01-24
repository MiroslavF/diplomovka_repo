const database = require('../../database');
const config = require('../../config');
const { cachingWrapper } = require('../../utilities');
const getNodeCount = require('../node-count');

const networkTable = config.network.tableName;

async function getDegrees() {
    const edges = await database(networkTable).select('a', 'b');
    const nodeToDegreeMap = new Map();
    for (let { a, b } of edges) {
        nodeToDegreeMap.set(a, (nodeToDegreeMap.get(a) || 0) + 1);
        nodeToDegreeMap.set(b, (nodeToDegreeMap.get(b) || 0) + 1);
    }
    return Array.from(nodeToDegreeMap.values());
}

async function buildDegreeFrequencyMap() {
    const degrees = await getDegrees();
    const degreeFrequencyMap = new Map();
    for (let degree of degrees) {
        degreeFrequencyMap.set(degree, (degreeFrequencyMap.get(degree) || 0) + 1);
    }
    return degreeFrequencyMap;
}

async function calculateNormalDegreeDistribution() {
    const degreeFrequencyMap = await buildDegreeFrequencyMap();
    const nodeCount = await getNodeCount();
    return Array.from(degreeFrequencyMap.entries()).map(([deg, freq]) => ({ k: deg, pk: freq / nodeCount }));
}

module.exports = cachingWrapper(calculateNormalDegreeDistribution, 'normal-degree-distribution');