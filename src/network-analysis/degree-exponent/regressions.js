const regression = require('regression');
const config = require('../../config');
const getNormalDegreeDistribution = require('../degree-distribution/normal');
const getNormalLogBinnedDegreeDistribution = require('../degree-distribution/normal-log-binned');
const getCumulativeDegreeDistribution = require('../degree-distribution/cumulative');
const getCumulativeLogBinnedDegreeDistribution = require('../degree-distribution/cumulative-log-binned');

const regressionType = config.analysis.degreeExponent.regressionType;

function getRegression(distribution) {
    if (regressionType === 'LINEAR') {
        const data = distribution.map(({ k, pk }) => [Math.log(k), Math.log(pk)]);
        const result = regression.linear(data, { precision: 4 });
        return { exp: result.equation[0], c: result.equation[1], r2: result.r2 };
    } else if (regressionType === 'POWER') {
        const data = distribution.map(({ k, pk }) => [k, pk]);
        const result = regression.power(data, { precision: 4 });
        return { exp: result.equation[1], c: result.equation[0], r2: result.r2 };
    }
    throw new Error('Invalid regressionType');
}

async function calculateFromNormal() {
    const distribution = await getNormalDegreeDistribution();
    return getRegression(distribution);
}

async function calculateFromNormalLogBinned() {
    const distribution = await getNormalLogBinnedDegreeDistribution();
    return getRegression(distribution);
}

async function calculateFromCumulative() {
    const distribution = await getCumulativeDegreeDistribution();
    return getRegression(distribution);
}

async function calculateFromCumulativeLogBinned() {
    const distribution = await getCumulativeLogBinnedDegreeDistribution();
    return getRegression(distribution);
}

async function calculateRegressions() {
    const normal = await calculateFromNormal();
    const normalLogBinned = await calculateFromNormalLogBinned();
    const cumulative = await calculateFromCumulative();
    const cumulativeLogBinned = await calculateFromCumulativeLogBinned();

    return {
        normal,
        normalLogBinned,
        cumulative,
        cumulativeLogBinned,
    };
}

module.exports = calculateRegressions;