const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');
const getAllCommunities = require('./helpers/get-all-communities');

async function getCommunitiesWithAvailableGameData() {
    const userDataMap = await getUserDataMap();
    const allCommunities = getAllCommunities();
    const resultCommunities = [];
    for (let kClique in allCommunities) {
        for (let community of allCommunities[kClique].communities) {
            if (community.every(steam_id => userDataMap.get(steam_id).game_data === true)) {
                resultCommunities.push(community);
            }
        }
    }
    return resultCommunities;
}

module.exports = cachingWrapper(
    getCommunitiesWithAvailableGameData,
    'communities-with-available-game-data',
    'steam-users'
);