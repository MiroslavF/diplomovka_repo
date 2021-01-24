const getCommunitiesWithAvailableCountryData = require('./communities-with-available-country-data');
const getUserDataMap = require('./user-data-map');
const { cachingWrapper } = require('../utilities');

const sum = (arr) => arr.reduce((sum, cur) => sum + cur, 0);

function count(array, targetItem) {
    return array.filter(item => item === targetItem).length;
}

function getDominantCountry(countries) {
    const countMap = new Map(countries.map(country => [country, count(countries, country)]));
    return countries.sort((c1, c2) => countMap.get(c2) - countMap.get(c1))[0];
}

async function calculateAverageCommunitySizePerDominantCountry() {
    const userDataMap = await getUserDataMap();
    const communities = await getCommunitiesWithAvailableCountryData();
    const countryToCommunitiesMap = new Map();
    for (let community of communities) {
        const countries = community.map(user => userDataMap.get(user).country);
        const dominantCountry = getDominantCountry(countries);
        const fraction = count(countries, dominantCountry) / countries.length;
        if (fraction > 0.5) {
            if (!countryToCommunitiesMap.has(dominantCountry)) {
                countryToCommunitiesMap.set(dominantCountry, []);
            }
            countryToCommunitiesMap.get(dominantCountry).push(community);
        }
    }
    return [...countryToCommunitiesMap]
        .map(([country, communities]) => ({ country, average: sum(communities.map(c => c.length)) / communities.length }))
        .sort(({ average: a1 }, { average: a2 }) => a2 - a1);
}

module.exports = cachingWrapper(
    calculateAverageCommunitySizePerDominantCountry,
    'average-community-size-per-dominant-country',
    'steam-users'
);