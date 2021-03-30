const sum = values => values.reduce((sum, curr) => sum + curr, 0);

function calculateAverage(values) {
    if (!values || !values.length) {
        return null;
    }
    return sum(values) / values.length;
}

function yearsPassed(timestamp) {
    return (Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24 * 365);
}

function calculateUsersAverages(users) {
    const usersWithsameCountryNeighboursFraction = users.filter(user => user.sameCountryNeighboursFraction !== null);
    const usersWithGameData = users.filter(user => user.game_data === true);
    const usersWithSteamLevel = users.filter(user => user.level !== null);
    const usersWithRegisterDate = users.filter(user => user.since !== null);
    const usersWithClusteringCoeficient = users.filter(user => user.clusteringCoefficient !== null);

    const avgFriendsCount = calculateAverage(users.map(userData => userData.neighbours.length));
    const avgSteamLevel = calculateAverage(usersWithSteamLevel.map(user => user.level));
    const avgGameCount = calculateAverage(usersWithGameData.map(user => user.games.length));
    const avgPlaytime = calculateAverage(usersWithGameData.map(user => sum(user.games.map(game => game.playtime))));
    const avgSameCountryNeighboursFraction = calculateAverage(usersWithsameCountryNeighboursFraction.map(user => user.sameCountryNeighboursFraction));
    const avgYearsRegistered = calculateAverage(usersWithRegisterDate.map(user => yearsPassed(user.since)));
    const avgCommunitiesMember = calculateAverage(users.map(user => user.communities));
    const avgMaxJoiningCommunities = calculateAverage(users.map(user => user.maxJoiningCommunities));
    const avgGamesGiniCoefficient = calculateAverage(usersWithGameData.map(user => user.topGamesGiniCoefficient));
    const avgClusteringCoefficient =  calculateAverage(usersWithClusteringCoeficient.map(user => user.clusteringCoefficient));

    return {
        avgFriendsCount,
        avgSteamLevel,
        avgGameCount,
        avgPlaytime,
        avgSameCountryNeighboursFraction,
        avgYearsRegistered,
        avgCommunitiesMember,
        avgMaxJoiningCommunities,
        avgGamesGiniCoefficient,
        avgClusteringCoefficient,
    };
}

module.exports = calculateUsersAverages;