const getUserDataMap = require('./user-data-map');
const getCommunitiesWithAvailableGameData = require('./communities-with-available-game-data');
const { cachingWrapper } = require('../utilities');
const config = require('../config');

const maxGamesCount = config.steamData.communityFavouriteGamesMatch.maxGamesCount;

function isInAllArrays(item, arrays) {
    return arrays.every(arr => arr.includes(item))
}

function matchingGameFound(community, topNGames, userDataMap) {
    const usersData = community.map(steamId => userDataMap.get(steamId));
    const appIdArrays = usersData
        .map(({ games }) => games
            .slice(0, topNGames)
            .map(game => game.game_app_id)
        )
    return appIdArrays[0].some(gameId => isInAllArrays(gameId, appIdArrays));
}

async function calculateCommunityFavouriteGamesMatch() {
    const communities = await getCommunitiesWithAvailableGameData();
    const userDataMap = await getUserDataMap();
    const result = [];
    for (let topNGames = 1; topNGames <= maxGamesCount; topNGames++ ) {
        const matchingCommunityCount = communities
            .filter(community => matchingGameFound(community, topNGames, userDataMap))
            .length
        result.push({
            topNGames,
            matchingCommunityFraction: matchingCommunityCount / communities.length,
        });
    }
    return result;
}

module.exports = cachingWrapper(calculateCommunityFavouriteGamesMatch, 'community-favourite-games-match', 'steam-users');