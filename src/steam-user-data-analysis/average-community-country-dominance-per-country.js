const getCommunitiesWithAvailableCountryData = require('./communities-with-available-country-data');
const getUserDataMap = require('./user-data-map');
const { cachingWrapper } = require('../utilities');

function count(array, targetItem) {
    return array.filter(item => item === targetItem).length;
}

function getDominantCountry(countries) {
    const countMap = new Map(countries.map(country => [country, count(countries, country)]));
    return countries.sort((c1, c2) => countMap.get(c2) - countMap.get(c1))[0];
}

async function calculateAverageCommunityCountryDominancePerCountry() {
    const userDataMap = await getUserDataMap();
    const communities = await getCommunitiesWithAvailableCountryData();
    const communityCountryFractionSumMap = new Map();
    const communityCountryFrequencyMap = new Map();
    for (let community of communities) {
        const countries = community.map(user => userDataMap.get(user).country);
        const dominantCountry = getDominantCountry(countries);
        const fractionSum = count(countries, dominantCountry) / countries.length;
        communityCountryFractionSumMap.set(
            dominantCountry,
            (communityCountryFractionSumMap.get(dominantCountry) || 0) + fractionSum,
        );
        communityCountryFrequencyMap.set(
            dominantCountry,
            (communityCountryFrequencyMap.get(dominantCountry) || 0) + 1,
        );
    }
    const getPlayerCount = (country) => [...userDataMap.values()].filter(u => u.country === country).length;
    return [...communityCountryFractionSumMap]
        .map(([country, sum]) => ({ country, average: sum / communityCountryFrequencyMap.get(country), playerCount: getPlayerCount(country), communityCount: communityCountryFrequencyMap.get(country) }))
        .sort(({ average: a1 }, { average: a2 }) => a2 - a1);
}

module.exports = cachingWrapper(
    calculateAverageCommunityCountryDominancePerCountry,
    'average-community-country-dominance-per-country',
    'steam-users'
);