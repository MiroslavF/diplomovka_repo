const calculateFromMaxDegree = require('./from-max-degree');
const calculateRegressions = require('./regressions');
const calculateRegressionsWithCutoffs = require('./regressions-with-cutoffs');
const calculateMaximumLikelihood = require('./maximum-likelihood');

async function calculateDegreeExponents() {
    const fromMaxDegree = await calculateFromMaxDegree();
    const regressions = await calculateRegressions();
    const regressionsWithCutoffs = await calculateRegressionsWithCutoffs();
    const maximumLikelihood = await calculateMaximumLikelihood();
    
    return {
        fromMaxDegree,
        regressions,
        regressionsWithCutoffs,
        maximumLikelihood,
    };
}

module.exports = calculateDegreeExponents;