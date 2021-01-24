const { cachingWrapper } = require('../../utilities');
const getCumulativeDegreeDistribution = require('./cumulative');
const getLogBinnedDegreeDistribution = require('../helpers/log-bin-distribution');

async function calculateCumulativeLogBinnedDegreeDistribution() {
    let cumulativeDegreeDistribution = await getCumulativeDegreeDistribution();
    cumulativeDegreeDistribution = cumulativeDegreeDistribution.map(({ k, pk }) => ({ x: k, p: pk }));
    let logBinned = getLogBinnedDegreeDistribution(cumulativeDegreeDistribution);
    return logBinned.map(({ x, p }) => ({ k: x, pk: p }));
}

module.exports = cachingWrapper(calculateCumulativeLogBinnedDegreeDistribution, 'cumulative-log-binned-degree-distribution');