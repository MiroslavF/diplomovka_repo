const { cachingWrapper } = require('../utilities');
const getGameData = require('./game-data');

async function calculateGamePlaytimeDistribution() {
    const games = await getGameData();
    const totalPlaytime = games.reduce((sum, game) => sum + Math.round(game.totalPlaytime), 0)
    const playtimeFractionToFrequencyMap = new Map();
    for (let game of games) {
        const playtimeFraction =  Math.round(game.totalPlaytime) / totalPlaytime;
        playtimeFractionToFrequencyMap.set(
            playtimeFraction,
            (playtimeFractionToFrequencyMap.get(playtimeFraction) || 0) + 1,
        );
    }
    return [...playtimeFractionToFrequencyMap].map(([playtimeFraction, freq ]) => ({ playtimeFraction, p: freq / games.length }));
}

module.exports = cachingWrapper(
    calculateGamePlaytimeDistribution,
    'game-playtime-distribution',
    'steam-users'
);