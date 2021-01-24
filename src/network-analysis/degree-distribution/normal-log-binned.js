const { cachingWrapper } = require('../../utilities');
const getNormalDegreeDistribution = require('./normal');
const getLogBinnedDistribution = require('../helpers/log-bin-distribution');

async function calculateNormalLogBinnedDegreeDistribution() {
    let normalDegreeDistribution = await getNormalDegreeDistribution();
    normalDegreeDistribution = normalDegreeDistribution.map(({ k, pk }) => ({ x: k, p: pk }));
    let logBinned = getLogBinnedDistribution(normalDegreeDistribution);
    return logBinned.map(({ x, p }) => ({ k: x, pk: p }));
}

module.exports = cachingWrapper(calculateNormalLogBinnedDegreeDistribution, 'normal-log-binned-degree-distribution');