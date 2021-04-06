const getUserDataMap = require('./user-data-map');
const getCommunitiesWithAvailableGameData = require('./communities-with-available-game-data');
const calculateRSD = require('./helpers/relative-standard-deviation');
const { cachingWrapper } = require('../utilities');
const getRandomMatchingCommunities = require('./helpers/random-communities');
const config = require('../config');

const randomCommunitySampleIterations = config.steamData.communityCorrelation.randomCommunitySampleIterations;

function yearsPassed(timestamp) {
    return (Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24 * 365);
}

const sum = arr => arr.reduce((sum, curr) => sum + curr, 0);

const getAverage = values => sum(values) / values.length;

const userProperties = [
    "friendsCount",
    "gameCount",
    "playtime",
    "yearsRegistered",
    "communitiesMember",
    "topGamesGiniCoefficient",
];

const propertyExtractionFunctions = {
    friendsCount: user => user.neighbours.length,
    gameCount: user => user.games.length,
    playtime: user => sum(user.games.map(game => game.playtime)),
    yearsRegistered: user => yearsPassed(user.since),
    communitiesMember: user => user.communities,
    topGamesGiniCoefficient: user => user.topGamesGiniCoefficient,
};

function getCommunityRSDs(community, userDataMap) {
    const usersData = community.map(steamId => userDataMap.get(steamId));
    const result = {};
    for (let property of userProperties) {
        const values = usersData.map(propertyExtractionFunctions[property]);
        result[property] = calculateRSD(values);
    }
    return result;
}

function getAveragedCommunityRSDs(communitiesRSDData) {
    const result = {};
    for (let property of userProperties) {
        result[property] = getAverage(communitiesRSDData.map(RSDs => RSDs[property])).toFixed(2);
    }
    return result;
}

function calculateCommunityAverageDeviations(communities, userDataMap) {
    const communitiesRSDData = communities.map(community => getCommunityRSDs(community, userDataMap));
    return getAveragedCommunityRSDs(communitiesRSDData);
}

function getPropertyRSDsFrequencies(property, randomMatchingCommunitiesRSDs) {
    const propertyRSDs = randomMatchingCommunitiesRSDs.map(RSDs => RSDs[property]);
    const propertyRSDFrequencyMap = new Map();
    for (let propertyRSD of propertyRSDs) {
        propertyRSD = Math.round(propertyRSD * 10) / 10;
        propertyRSDFrequencyMap.set(
            propertyRSD,
            (propertyRSDFrequencyMap.get(propertyRSD) || 0) + 1,
        )
    }
    return [...propertyRSDFrequencyMap]
        .map(([propertyRSD, frequency]) => ({ RSD: propertyRSD, count: frequency }))
        .sort(({ RSD: rsd1 }, { RSD: rsd2 }) => rsd2 - rsd1);
}

async function calculateCommunityCorrelations() {
    const userDataMap = await getUserDataMap();
    const realCommunities = await getCommunitiesWithAvailableGameData();

    const randomMatchingCommunitiesRSDs = [];
    for (let i = 1; i <= randomCommunitySampleIterations; i++) {
        console.log(`Community correlations: iteration ${i}`);
        const randomMatchingCommunities = getRandomMatchingCommunities(realCommunities, userDataMap);
        randomMatchingCommunitiesRSDs.push(calculateCommunityAverageDeviations(randomMatchingCommunities, userDataMap))
    }
    const realCommunitiesAveragedDeviations = calculateCommunityAverageDeviations(realCommunities, userDataMap);
    return {
        realCommunitiesAveragedDeviations,
        generatedCommunities: {
            friendsCount: getPropertyRSDsFrequencies('friendsCount', randomMatchingCommunitiesRSDs),
            gameCount: getPropertyRSDsFrequencies('gameCount', randomMatchingCommunitiesRSDs),
            playtime: getPropertyRSDsFrequencies('playtime', randomMatchingCommunitiesRSDs),
            yearsRegistered: getPropertyRSDsFrequencies('yearsRegistered', randomMatchingCommunitiesRSDs),
            communitiesMember: getPropertyRSDsFrequencies('communitiesMember', randomMatchingCommunitiesRSDs),
            topGamesGiniCoefficient: getPropertyRSDsFrequencies('topGamesGiniCoefficient', randomMatchingCommunitiesRSDs),
        }
    };
}

module.exports = cachingWrapper(calculateCommunityCorrelations, 'community-correlations', 'steam-users');

