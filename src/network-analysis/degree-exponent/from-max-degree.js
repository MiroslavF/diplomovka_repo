const getNodeCount = require('./../node-count');
const getNormalDegreeDistribution = require('./../degree-distribution/normal');

async function calculateFromMaxDegree() {
    const nodeCount = await getNodeCount();
    const normalDegreeDistribution = await getNormalDegreeDistribution();
    const maxDegree = normalDegreeDistribution.reduce((max, { k }) => Math.max(k, max), 0);
    return (Math.log(nodeCount) + Math.log(maxDegree)) / Math.log(maxDegree);
}

module.exports = calculateFromMaxDegree;