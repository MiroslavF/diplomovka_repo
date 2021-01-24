const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');

async function calculateAverageSameCountryNeighbourFractionPerK() {
    const userDataMap = await getUserDataMap();
    const kToFractionSumMap = new Map();
    const kFreqMap = new Map();
    const usersWithSameCountryNeighboursFraction = [...userDataMap.values()]
        .filter(userData => userData.sameCountryNeighboursFraction !== null);
    
    for (let userData of usersWithSameCountryNeighboursFraction) {
        const k = userData.neighbours.length;
        kToFractionSumMap.set(k, (kToFractionSumMap.get(k) || 0) + userData.sameCountryNeighboursFraction);
        kFreqMap.set(k, (kFreqMap.get(k) || 0) + 1);
    }
    return [...kToFractionSumMap]
        .map(([k, fractionSum]) => ({ k, average: fractionSum / kFreqMap.get(k) }))
        .sort(({ average: a1 }, { average: a2 }) => a2 - a1);
}

module.exports = cachingWrapper(
    calculateAverageSameCountryNeighbourFractionPerK,
    'average-same-country-neighbour-fraction-per-k',
    'steam-users'
);