const getHierarchicalClustering = require('./hierarchical-clustering');
const { cachingWrapper } = require('../../utilities');
const getLogBinnedDistribution = require('../helpers/log-bin-distribution');

async function calculateLogBinnedHierarchicalClustering() {
    let hierarchicalClustering = await getHierarchicalClustering();
    hierarchicalClustering = hierarchicalClustering.map(({ k, ck }) => ({ x: k, p: ck }));
    let logBinned = getLogBinnedDistribution(hierarchicalClustering);
    return logBinned.map(({ x, p }) => ({ k: x, ck: p }));
}

module.exports = cachingWrapper(calculateLogBinnedHierarchicalClustering, 'log-binned-hierarchical-clustering');