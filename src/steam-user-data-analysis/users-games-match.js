const getUserDataMap = require('./user-data-map');
const database = require('../database');
const config = require('../config');
const { cachingWrapper } = require('../utilities');

const networkTable = config.network.tableName;
const maxGamesCount = config.steamData.usersGamesMatch.maxGamesCount;

function matchingGameFound(userA, userB, topGamesCount, userDataMap) {
    const userATopNGameIds = userDataMap.get(userA).games.slice(0, topGamesCount).map(g => g.game_app_id);
    const userBTopNGameIds = userDataMap.get(userB).games.slice(0, topGamesCount).map(g => g.game_app_id);
    return userATopNGameIds.some((id) => userBTopNGameIds.includes(id));
}

async function calculateUsersGamesMatch() {
    const userDataMap = await getUserDataMap();
    const edges = await database(networkTable).select('a', 'b');
    const edgesWithGamesData = edges.filter(({ a: userA, b: userB }) => {
        return userDataMap.get(userA).game_data && userDataMap.get(userB).game_data;
    });
    const result = [];
    for (let topGamesCount = 1; topGamesCount <= maxGamesCount; topGamesCount++) {
        let matchingEdgesCount = 0;
        for (let { a: userA, b: userB } of edgesWithGamesData) {
            if (matchingGameFound(userA, userB, topGamesCount, userDataMap)) {
                matchingEdgesCount++;
            }
        }
        result.push({
            topGamesCount,
            matchingGameFraction: matchingEdgesCount / edgesWithGamesData.length,
        });
    }
    return result;
}

module.exports = cachingWrapper(calculateUsersGamesMatch, 'users-games-match', 'steam-users');
