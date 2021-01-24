const getCommunitiesWithAvailableCountryData = require('./communities-with-available-country-data');
const getUserDataMap = require('./user-data-map');
const { cachingWrapper } = require('../utilities');

function count(array, targetItem) {
    return array.filter(item => item === targetItem).length;
}

function getDominantCountryFraction(countries) {
    const countMap = new Map(countries.map(country => [country, count(countries, country)]));
    const dominantCountryCount = countries.reduce((max, country) => Math.max(max, countMap.get(country)), -Infinity);
    return dominantCountryCount / countries.length;
}

async function calculateAverageCommunityCountryDominance() {
    const userDataMap = await getUserDataMap();
    const communities = await getCommunitiesWithAvailableCountryData();
    let fractionSum = 0;
    for (let community of communities) {
        const countries = community.map(user => userDataMap.get(user).country);
        fractionSum += getDominantCountryFraction(countries);
    }
    return fractionSum / communities.length;
}

module.exports = cachingWrapper(
    calculateAverageCommunityCountryDominance,
    'average-community-country-dominance',
    'steam-users'
);