const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');
const getGameData = require('./game-data');
const getAllCommunities = require('./helpers/get-all-communities');
const getCommunitiesWithAvailableCountryData = require('./communities-with-available-country-data');
const getCommunitiesWithAvailableGameData = require('./communities-with-available-game-data');

function calculateCommunityCount(allCommunities) {
    let communityCount = 0;
    for (let kClique in allCommunities) {
        communityCount += allCommunities[kClique].communities.length;
    }
    return communityCount;
}

async function calculateCounts() {
    const userDataMap = await getUserDataMap();
    const gameData = await getGameData();
    const allCommunities = await getAllCommunities();
    const communitiesWithAvailableCountryData = await getCommunitiesWithAvailableCountryData();
    const communitiesWithAvailableGameData = await getCommunitiesWithAvailableGameData();

    const allUsers = [...userDataMap.values()];
    const usersWithCountry = allUsers.filter(user => user.country !== null);

    const playerCount = [...userDataMap].length;
    const gameCount = gameData.length;
    const totalPlaytime = gameData.reduce((sum, game) => sum + game.totalPlaytime, 0);
    const availableCountryPlayerCount = allUsers.filter(user => user.country !== null).length;
    const availableGameDataPlayerCount = allUsers.filter(user => user.game_data === true).length;
    const communityCount = calculateCommunityCount(allCommunities);
    const countryCount = new Set(usersWithCountry.map(user => user.country)).size;
    const availableCountryCommunityCount = communitiesWithAvailableCountryData.length;
    const availableGameDataCommunityCount = communitiesWithAvailableGameData.length;
    const playersWithoutCommunityCount = allUsers.filter(user => user.communities === 0).length;

    return {
        playerCount,
        gameCount,
        availableCountryPlayerCount,
        availableGameDataPlayerCount,
        communityCount,
        countryCount,
        availableCountryCommunityCount,
        availableGameDataCommunityCount,
        totalPlaytime,
        playersWithoutCommunityCount,
    };
}

module.exports = cachingWrapper(calculateCounts, 'counts', 'steam-users');