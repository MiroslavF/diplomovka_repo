function chooseRandom(values) {
    return values[Math.floor(values.length * Math.random())]
}

function getFavouriteGameId(user) {
    return user.games[0].game_app_id;
}

function matchedCountry(targetCountry, user) {
    if (!targetCountry) {
        return true;
    }
    return targetCountry === user.country;
}

function getRandomMatchingUser(user, allUsers) {
    const targetFavouriteGameId = getFavouriteGameId(user);
    const targetCountry = user.country;
    const validChoices = allUsers.filter(user => getFavouriteGameId(user) === targetFavouriteGameId && matchedCountry(targetCountry, user));
    return chooseRandom(validChoices);
}

function getRandomMatchingCommunity(community, userDataMap, allUsers) {
    return community
        .map(steamId => userDataMap.get(steamId))
        .map(user => getRandomMatchingUser(user, allUsers))
        .map(user => user.steam_id);
}

function getRandomMatchingCommunities(realCommunities, userDataMap) {
    const allUsers = [...userDataMap.values()].filter(user => user.game_data && user.since && user.country && user.level);
    return realCommunities.map(community => getRandomMatchingCommunity(community, userDataMap, allUsers))
}

module.exports = getRandomMatchingCommunities;