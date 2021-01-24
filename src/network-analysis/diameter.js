const getDistanceDistribution = require('./distance-distribution');
const { cachingWrapper } = require('../utilities');

async function calculateDiameter() {
    const distanceDistribution = await getDistanceDistribution();
    return distanceDistribution.reduce((maxDistance, { d }) => Math.max(maxDistance, d), 0);
}

module.exports = cachingWrapper(calculateDiameter, 'diameter');
