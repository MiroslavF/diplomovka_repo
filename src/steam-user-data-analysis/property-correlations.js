const getUserDataMap = require('./user-data-map');
const calculateUsersAverages = require('./helpers/calculate-users-averages');
const config = require('../config');

const sum = values => values.reduce((sum, curr) => sum + curr, 0);

function yearsPassed(timestamp) {
    return (Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24 * 365);
}

const userProperties = [
    "friendsCount",
    "steamLevel",
    "gameCount",
    "playtime",
    "sameCountryNeighboursFraction",
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
    sameCountryNeighboursFraction: user => user.sameCountryNeighboursFraction,
    yearsRegistered: user => yearsPassed(user.since),
    communitiesMember: user => user.communities,
    maxJoiningCommunities: user => user.maxJoiningCommunities,
    topGamesGiniCoefficient: user => user.topGamesGiniCoefficient,
};

const propertyUserFilterFunctions = {
    friendsCount: user => true,
    steamLevel: user => user.level !== null,
    gameCount: user => user.game_data === true,
    playtime: user => user.game_data === true,
    sameCountryNeighboursFraction: user => user.sameCountryNeighboursFraction !== null,
    yearsRegistered: user => user.since !== null,
    communitiesMember: user => true,
    maxJoiningCommunities: user => true,
    topGamesGiniCoefficient: user => user.game_data === true,
};

function getBinnedValue(property, user) {
    const binSize = config.steamData.propertyCorrelations[property].binSize;
    const value = propertyExtractionFunctions[property](user);
    return Math.round(value / binSize) * binSize;
}

function isCorrectRange(property, value) {
    const { min, max } = config.steamData.propertyCorrelations[property].range;
    return value >= min && value <= max;
}

function calculatePropertyAverageMinMaxValues(averagesPoints) {
    return {
        friendsCount: {
            minAvg: Math.min(...averagesPoints.map(({ avgFriendsCount }) => avgFriendsCount)),
            maxAvg: Math.max(...averagesPoints.map(({ avgFriendsCount }) => avgFriendsCount)),
        },
        steamLevel: {
            minAvg: Math.min(...averagesPoints.map(({ avgSteamLevel }) => avgSteamLevel)),
            maxAvg: Math.max(...averagesPoints.map(({ avgSteamLevel }) => avgSteamLevel)),
        },
        gameCount: {
            minAvg: Math.min(...averagesPoints.map(({ avgGameCount }) => avgGameCount)),
            maxAvg: Math.max(...averagesPoints.map(({ avgGameCount }) => avgGameCount)),
        },
        playtime: {
            minAvg: Math.min(...averagesPoints.map(({ avgPlaytime }) => avgPlaytime)),
            maxAvg: Math.max(...averagesPoints.map(({ avgPlaytime }) => avgPlaytime)),
        },
        sameCountryNeighboursFraction: {
            minAvg: Math.min(...averagesPoints.map(({ avgSameCountryNeighboursFraction }) => avgSameCountryNeighboursFraction)),
            maxAvg: Math.max(...averagesPoints.map(({ avgSameCountryNeighboursFraction }) => avgSameCountryNeighboursFraction)),
        },
        yearsRegistered: {
            minAvg: Math.min(...averagesPoints.map(({ avgYearsRegistered }) => avgYearsRegistered)),
            maxAvg: Math.max(...averagesPoints.map(({ avgYearsRegistered }) => avgYearsRegistered)),
        },
        communitiesMember: {
            minAvg: Math.min(...averagesPoints.map(({ avgCommunitiesMember }) => avgCommunitiesMember)),
            maxAvg: Math.max(...averagesPoints.map(({ avgCommunitiesMember }) => avgCommunitiesMember)),
        },
        maxJoiningCommunities: {
            minAvg: Math.min(...averagesPoints.map(({ avgMaxJoiningCommunities }) => avgMaxJoiningCommunities)),
            maxAvg: Math.max(...averagesPoints.map(({ avgMaxJoiningCommunities }) => avgMaxJoiningCommunities)),
        },
        topGamesGiniCoefficient: {
            minAvg: Math.min(...averagesPoints.map(({ avgGamesGiniCoefficient }) => avgGamesGiniCoefficient)),
            maxAvg: Math.max(...averagesPoints.map(({ avgGamesGiniCoefficient }) => avgGamesGiniCoefficient)),
        },
    };
}

function normalizeValue(value, MinMaxAvg) {
    if (!value) {
        return null;
    }
    const { minAvg, maxAvg } = MinMaxAvg;
    return (value - minAvg) / (maxAvg - minAvg)
}

function normalizeAverages(averages, MinMaxAvgValues) {
    return {
        friendsCount: normalizeValue(averages.avgFriendsCount, MinMaxAvgValues.friendsCount),
        steamLevel: normalizeValue(averages.avgSteamLevel, MinMaxAvgValues.steamLevel),
        gameCount: normalizeValue(averages.avgGameCount, MinMaxAvgValues.gameCount),
        playtime: normalizeValue(averages.avgPlaytime, MinMaxAvgValues.playtime),
        sameCountryNeighboursFraction: normalizeValue(averages.avgSameCountryNeighboursFraction, MinMaxAvgValues.sameCountryNeighboursFraction),
        yearsRegistered: normalizeValue(averages.avgYearsRegistered, MinMaxAvgValues.yearsRegistered),
        communitiesMember: normalizeValue(averages.avgCommunitiesMember, MinMaxAvgValues.communitiesMember),
        maxJoiningCommunities: normalizeValue(averages.avgMaxJoiningCommunities, MinMaxAvgValues.maxJoiningCommunities),
        topGamesGiniCoefficient: normalizeValue(averages.avgGamesGiniCoefficient, MinMaxAvgValues.topGamesGiniCoefficient),
    };
}

async function calculatePropertyCorrelations(property) {
    if (!property || !userProperties.includes(property)) {
        console.log(`Unknown property ${property}`);
        return null;
    }
    const userDataMap = await getUserDataMap();
    const allUsers = [...userDataMap.values()];
    const possibleValues = [...new Set(allUsers
        .filter(propertyUserFilterFunctions[property])
        .map(user => getBinnedValue(property, user))
        .filter(value => isCorrectRange(property, value))
        )]
        .sort((fst, snd) => fst - snd);
    const propertyWithAveragesPoints = possibleValues.map(value => {
        let matchingUsers = allUsers
            .filter(propertyUserFilterFunctions[property])
            .filter(user => getBinnedValue(property, user) === value);
        return {
            [property]: value,
            averages: calculateUsersAverages(matchingUsers),
        };
    });
    const averagesPoints = propertyWithAveragesPoints.map(_ => _.averages);
    const propertyAverageMinMaxValues = calculatePropertyAverageMinMaxValues(averagesPoints);
    return propertyWithAveragesPoints.map(_ => {
        return {
            ..._,
            normalizedAverages: normalizeAverages(_.averages, propertyAverageMinMaxValues),
        };
    });

}
// calculatePropertyCorrelations('friendsCount').then(data => console.log(data));
module.exports = calculatePropertyCorrelations;