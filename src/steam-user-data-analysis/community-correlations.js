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
    "steamLevel",
    "gameCount",
    "playtime",
    "yearsRegistered",
    "communitiesMember",
    "maxJoiningCommunities",
    "topGamesGiniCoefficient",
];

const propertyExtractionFunctions = {
    friendsCount: user => user.neighbours.length,
    steamLevel: user => user.level,
    gameCount: user => user.games.length,
    playtime: user => sum(user.games.map(game => game.playtime)),
    yearsRegistered: user => yearsPassed(user.since),
    communitiesMember: user => user.communities,
    maxJoiningCommunities: user => user.maxJoiningCommunities,
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
        result[property] = getAverage(communitiesRSDData.map(RSDs => RSDs[property]));
    }
    return result;
}

function calculateCommunityAverageDeviations(communities, userDataMap) {
    const communitiesRSDData = communities.map(community => getCommunityRSDs(community, userDataMap));
    return getAveragedCommunityRSDs(communitiesRSDData);
}

function higherValuePercentage(realCommunitiesAverageRSDs, averagedRandomMatchingCommunityRSDs) {
    const result = {};
    for (let property in realCommunitiesAverageRSDs) {
        const higherValuesCount = averagedRandomMatchingCommunityRSDs.filter(RSDs => RSDs[property] > realCommunitiesAverageRSDs[property]).length;
        result[property] = (higherValuesCount / averagedRandomMatchingCommunityRSDs.length) * 100;
    }
    return result;
}

async function calculateCommunityCorrelations() {
    const userDataMap = await getUserDataMap();
    const realCommunities = await getCommunitiesWithAvailableGameData();

    const averagedRandomMatchingCommunityRSDs = [];
    for (let i = 1; i <= randomCommunitySampleIterations ; i++) {
        console.log(`Community correlations: iteration ${i}`);
        const randomMatchingCommunities = getRandomMatchingCommunities(realCommunities, userDataMap);
        averagedRandomMatchingCommunityRSDs.push(calculateCommunityAverageDeviations(randomMatchingCommunities, userDataMap));
    }
    const realCommunityAveragedDeviations = calculateCommunityAverageDeviations(realCommunities, userDataMap);
    return {
        realCommunityAveragedDeviations,
        higherValuePercentage: higherValuePercentage(realCommunityAveragedDeviations, averagedRandomMatchingCommunityRSDs),
    };
}

module.exports = cachingWrapper(calculateCommunityCorrelations, 'community-correlations', 'steam-users');

