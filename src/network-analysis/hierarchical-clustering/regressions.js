const regression = require('regression');
const config = require('../../config');
const getHierarchicalClustering = require('./hierarchical-clustering');
const getLogBinnedHierarchicalClustering = require('./log-binned');

const regressionType = config.analysis.hierarchicalClustering.regressionType;
const cutOffSettings = config.analysis.hierarchicalClustering.cutoffs;

function getRegression(clustering) {
    if (regressionType === 'LINEAR') {
        const data = clustering.map(({ k, ck }) => [Math.log(k), Math.log(ck)]);
        const result = regression.linear(data, { precision: 4 });
        return { exp: result.equation[0], c: result.equation[1], r2: result.r2 };
    } else if (regressionType === 'POWER') {
        const data = clustering.map(({ k, ck }) => [k, ck]);
        const result = regression.power(data, { precision: 4 });
        return { exp: result.equation[1], c: result.equation[0], r2: result.r2 };
    }
    throw new Error('Invalid regressionType');
}

function withCutOffs(clustering, settings) {
    clustering.sort((fst, snd) => fst.k - snd.k);
    const { leftOutlierCount, rightOutlierCount } = settings;
    for (let i = 0; i < leftOutlierCount; i++) { clustering.shift() }
    for (let i = 0; i < rightOutlierCount; i++) { clustering.pop() }
    clustering = clustering.filter(({ k, ck}) => ck > 0);
    if (clustering.length < 3) {
        throw new Error('Number of outliers to cutoff is too high')
    }
    return { ...getRegression(clustering), kMin: clustering[0].k, kMax: clustering[clustering.length-1].k };
}

async function calculateFromNormal() {
    const clustering = await getHierarchicalClustering();
    const settings = cutOffSettings.normal;
    return withCutOffs(clustering, settings);
}

async function calculateFromLogBinned() {
    const clustering = await getLogBinnedHierarchicalClustering();
    const settings = cutOffSettings.logBinned;
    return withCutOffs(clustering, settings);
}

async function calculateRegressions() {
    const normal = await calculateFromNormal();
    const logBinned = await calculateFromLogBinned()

    return {
        normal,
        logBinned
    };
}
module.exports = calculateRegressions;