const getDistanceDistribution = require('./distance-distribution');
const getNodeCount = require('./node-count');
const { cachingWrapper } = require('../utilities');

async function calculateAverageDistance() {
    const distanceDistribution = await getDistanceDistribution();
    const nodeCount = await getNodeCount();
    const totalDistances = nodeCount * (nodeCount - 1) / 2;
    const distanceFrequencies = distanceDistribution.map(({ d, pd }) => ({ d, count: pd * totalDistances }));
    const distanceSum = distanceFrequencies.reduce((sum, { d, count }) => sum + d * count, 0);
    return distanceSum / totalDistances;
}

module.exports = cachingWrapper(calculateAverageDistance, 'average-distance');
