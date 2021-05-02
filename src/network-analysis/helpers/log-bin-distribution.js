const config = require('../../config');

const BIN_SCALE_FACTOR = config.analysis.degreeDistribution.logBinScaleFactor;

function getBinSize(n) {
    return BIN_SCALE_FACTOR ** n;
}

function getBinIndex(x) {
    let divisionCount = 0;
    while (x > 1) {
        x = Math.floor(x / BIN_SCALE_FACTOR);
        divisionCount++;
    }
    return divisionCount;
}

function createEmptyBins(maxDegree) {
    return new Array(getBinIndex(maxDegree) + 1).fill().map(_ => new Array());
}

function getAverageBinDegree(bin) {
    const degreeSum = bin.reduce((sum, { x }) => sum + x, 0);
    return degreeSum / bin.length;
}

function getBinProbabilitySum(bin) {
    return bin.reduce((sum, { p }) => sum + p, 0);
}

function calculateLogBinnedDistribution(distribution) {
    const maxDegree = distribution.reduce((maxDeg, { x }) => Math.max(maxDeg, x), 0);
    const bins = createEmptyBins(maxDegree);
    for (let point of distribution) {
        bins[getBinIndex(point.x)].push(point);
    }
    return bins
        .filter(bin => bin.length > 0)
        .map((bin, index) => ({ x: getAverageBinDegree(bin), p: getBinProbabilitySum(bin) / getBinSize(index) }));
}

module.exports = calculateLogBinnedDistribution;