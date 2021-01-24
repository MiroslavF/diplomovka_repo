const regression = require('regression');
const config = require('../../config');
const getNormalDegreeDistribution = require('../degree-distribution/normal');
const getNormalLogBinnedDegreeDistribution = require('../degree-distribution/normal-log-binned');
const getCumulativeDegreeDistribution = require('../degree-distribution/cumulative');
const getCumulativeLogBinnedDegreeDistribution = require('../degree-distribution/cumulative-log-binned');

const regressionType = config.analysis.degreeExponent.regressionType;
const cutOffSettings = config.analysis.degreeExponent.cutoffs;

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

function withCutOffs(distribution, settings) {
    distribution.sort((fst, snd) => fst.k - snd.k);
    let { method, maxDelta, startPositionFraction, leftOutlierCount, rightOutlierCount } = settings;
    if (method === 'outlierCount') {
        for (let i = 0; i < leftOutlierCount; i++) { distribution.shift() }
        for (let i = 0; i < rightOutlierCount; i++) { distribution.pop() }
        if (distribution.length < 3) {
            throw new Error('Number of outliers to cutoff is too high')
        }
        return { ...getRegression(distribution), kMin: distribution[0].k, kMax: distribution[distribution.length-1].k };
    }
    const midIndex = Math.floor(distribution.length / 2)
    let kMinIndex = midIndex - Math.round(startPositionFraction * midIndex) - 1;
    let kMaxIndex = midIndex + Math.round(startPositionFraction * midIndex) + 1;
    let delta = 0;
    let lastRegression = getRegression(distribution.slice(kMinIndex, kMaxIndex + 1));
    while (kMinIndex > 0 && kMaxIndex < distribution.length - 1 && delta < maxDelta) {
        let currentRegression = getRegression(distribution.slice(kMinIndex, kMaxIndex + 1));
        delta = Math.abs(currentRegression.exp - lastRegression.exp);
        lastRegression = currentRegression;
        kMinIndex -= 1;
        kMaxIndex += 1;
    }
    return { ...lastRegression, kMin: distribution[kMinIndex].k, kMax: distribution[kMaxIndex].k };
}

async function calculateFromNormal() {
    const distribution = await getNormalDegreeDistribution();
    const settings = cutOffSettings.normal;
    return withCutOffs(distribution, settings);
}

async function calculateFromNormalLogBinned() {
    const distribution = await getNormalLogBinnedDegreeDistribution();
    const settings = cutOffSettings.normalLogBinned;
    return withCutOffs(distribution, settings);
}

async function calculateFromCumulative() {
    const distribution = await getCumulativeDegreeDistribution();
    const settings = cutOffSettings.cumulative;
    return withCutOffs(distribution, settings);
}

async function calculateFromCumulativeLogBinned() {
    const distribution = await getCumulativeLogBinnedDegreeDistribution();
    const settings = cutOffSettings.cumulativeLogBinned;
    return withCutOffs(distribution, settings);
}

async function calculateRegressionsWithCutoffs() {
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
module.exports = calculateRegressionsWithCutoffs;