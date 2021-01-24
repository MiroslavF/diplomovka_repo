const { cachingWrapper } = require('../utilities');
const getGameData = require('./game-data');

async function calculateGamesAverages() {
    const games = await getGameData();
    const totalPlaytime = games.reduce((sum, game) => sum + game.totalPlaytime, 0);
    const totalUserCount = games.reduce((sum, game) => sum + game.userCount, 0);
    return {
        avgGamePlaytime: totalPlaytime / games.length,
        avgGameUserCount: totalUserCount / games.length,
    };
}


module.exports = cachingWrapper(calculateGamesAverages, 'games-averages', 'steam-users');