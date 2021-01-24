const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');

async function calculateAverageSameCountryNeighbourFractionPerCountry() {
    const userDataMap = await getUserDataMap();
    const countryToFractionSumMap = new Map();
    const countryFreqMap = new Map();
    const usersWithSameCountryNeighboursFraction = [...userDataMap.values()]
        .filter(userData => userData.sameCountryNeighboursFraction !== null);
    
    for (let userData of usersWithSameCountryNeighboursFraction) {
        const country = userData.country;
        countryToFractionSumMap.set(
            country,
            (countryToFractionSumMap.get(country) || 0) + userData.sameCountryNeighboursFraction
        );
        countryFreqMap.set(country, (countryFreqMap.get(country) || 0) + 1);
    }
    return [...countryToFractionSumMap]
        .map(([country, fractionSum]) => ({ country, average: fractionSum / countryFreqMap.get(country) }))
        .sort(({ average: a1 }, { average: a2 }) => a2 - a1);
}

module.exports = cachingWrapper(
    calculateAverageSameCountryNeighbourFractionPerCountry,
    'average-same-country-neighbour-fraction-per-country',
    'steam-users'
);