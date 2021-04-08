const getNodeCount = require('./../node-count');
const getNormalDegreeDistribution = require('./../degree-distribution/normal');

async function calculateFromMaxDegree() {
    const nodeCount = await getNodeCount();
    const normalDegreeDistribution = await getNormalDegreeDistribution();
    const maxDegree = normalDegreeDistribution.reduce((max, { k }) => Math.max(k, max), 0);
    const minDegree = normalDegreeDistribution.reduce((min, { k }) => Math.min(k, min), Infinity);
    return (1 / ((Math.log(maxDegree) - Math.log(minDegree)) / Math.log(nodeCount))) + 1;
}

module.exports = calculateFromMaxDegree;