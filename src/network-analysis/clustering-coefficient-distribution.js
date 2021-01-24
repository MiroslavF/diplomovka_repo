const config = require('../config');
const { cachingWrapper } = require('../utilities');
const getClusteringCoefficient = require('./helpers/clustering-coefficient');
const getNodeToNeighboursMap = require('./helpers/node-to-neighbours-map');

const roundCoefficients = config.analysis.clusteringCoefficientDistribution.roundCoefficients;
const roundDecimalPlace = config.analysis.clusteringCoefficientDistribution.roundDecimalPlace;
const removeTopOutliers = config.analysis.clusteringCoefficientDistribution.removeTopOutliers;

async function calculateClusteringCoefficientDistribution() {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const nodes = Array.from(nodeToNeighboursMap.keys());
    let coefficients = nodes
        .map(node => getClusteringCoefficient(node, nodeToNeighboursMap))
        .filter(c => c !== null);
    const coefficientFrequencyMap = new Map();
    for (let c of coefficients) {
        coefficientFrequencyMap.set(c, (coefficientFrequencyMap.get(c) || 0) + 1);
    }
    return Array.from(coefficientFrequencyMap.entries()).map(([c, freq]) => ({ c, pc: freq / coefficients.length }));
}

module.exports = async function() {
    let distribution = await cachingWrapper(calculateClusteringCoefficientDistribution, 'clustering-coefficient-distribution')();
    if (roundCoefficients) {
        const distributionMap = new Map();
        distribution.forEach(({ c, pc }) => {
            const roundedC = Math.round(c * 10**roundDecimalPlace) / 10**roundDecimalPlace;
            if (distributionMap.has(roundedC)) {
                distributionMap.set(roundedC, distributionMap.get(roundedC) + pc);
            } else {
                distributionMap.set(roundedC, pc);
            }
        });
        distribution = Array.from(distributionMap.entries()).map(([c, pc]) => ({ c, pc }));
    }
    if (removeTopOutliers > 0) {
        distribution.sort(({ pc: fstPc }, { pc: sndPc }) => fstPc - sndPc);
        for (let i = 0; i < removeTopOutliers; i++) { distribution.pop() }
    }
    return distribution;
}