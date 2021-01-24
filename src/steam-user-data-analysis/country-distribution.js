const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');

async function calculateCountryDistribution(){
    const userDataMap = await getUserDataMap();
    const usersWithCountry = [...userDataMap.values()].filter(user => user.country !== null);
    const countryFrequencyMap = new Map();
    for (let { country } of usersWithCountry) {
        countryFrequencyMap.set(country, (countryFrequencyMap.get(country) || 0) + 1);
    }
    return Array.from(countryFrequencyMap.entries())
        .map(([country, freq]) => ({ country, p: freq / usersWithCountry.length }))
        .sort(({ p: p1 }, { p: p2 }) => p2 - p1);
}

module.exports = cachingWrapper(calculateCountryDistribution, 'country-distribution', 'steam-users');