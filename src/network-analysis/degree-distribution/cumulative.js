const { cachingWrapper } = require('../../utilities');
const getNormalDegreeDistribution = require('./normal');

function getComplementaryCumulativeValue(degree, degreeDistribution) {
    return degreeDistribution.reduce((sum, { k, pk }) => sum + (k > degree ? pk : 0), 0);
} 

async function calculateCumulativeDegreeDistribution() {
    const degreeDistribution = await getNormalDegreeDistribution();
    return degreeDistribution
        .map(({ k }) => ({ k, pk: getComplementaryCumulativeValue(k, degreeDistribution) }))
        .filter(({ pk }) => pk > 0);
}

module.exports = cachingWrapper(calculateCumulativeDegreeDistribution, 'cumulative-degree-distribution');
