const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');

async function calculateGameData() {
    const userDataMap = await getUserDataMap();
    const usersWithGameData = [...userDataMap.values()]
        .filter(userData => userData.game_data);
    const gameDataMap = new Map();
    for (let userData of usersWithGameData) {
        for (let { name, playtime, game_app_id } of userData.games) {
            const gameData = gameDataMap.get(game_app_id) || {
                app_id: game_app_id,
                name: name,
                totalPlaytime: 0,
                userCount: 0,
            };
            gameData.totalPlaytime += playtime;
            gameData.userCount += 1;
            gameDataMap.set(game_app_id, gameData);
        }
    }
    return [...gameDataMap.values()].sort(({ totalPlaytime: tp1 }, { totalPlaytime: tp2 }) => tp2 - tp1);
}

module.exports = cachingWrapper(calculateGameData, 'game-data', 'steam-users');