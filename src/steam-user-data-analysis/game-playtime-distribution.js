const { cachingWrapper } = require('../utilities');
const getGameData = require('./game-data');

async function calculateGamePlaytimeDistribution() {
    const games = await getGameData();
    const playtimeToFrequencyMap = new Map();
    for (let game of games) {
        const playtime =  Math.round(game.totalPlaytime);
        playtimeToFrequencyMap.set(
            playtime,
            (playtimeToFrequencyMap.get(playtime) || 0) + 1,
        );
    }
    return [...playtimeToFrequencyMap].map(([playtime, freq ]) => ({ playtime, p: freq / games.length }));
}

module.exports = cachingWrapper(
    calculateGamePlaytimeDistribution,
    'game-playtime-distribution',
    'steam-users'
);