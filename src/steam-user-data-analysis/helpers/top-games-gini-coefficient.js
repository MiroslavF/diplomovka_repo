const gini = require("gini");

function getTopGamesByFraction(games, fraction) {
    const sortedGames = [...games].sort((g1, g2) => g2.playtime - g1.playtime);
    const totalPlaytime = games.reduce((sum, game) => sum + game.playtime, 0);
    const maxPlaytime = fraction * totalPlaytime;
    const topGames = [];
    let currentPlaytime = 0;
    for (let game of sortedGames) {
        currentPlaytime += game.playtime;
        topGames.push(game);
        if (currentPlaytime >= maxPlaytime) {
            return topGames;
        }
    }
    return topGames;
}

function getTopGamesByCount(games, count) {
    return [...games].sort((g1, g2) => g2.playtime - g1.playtime).slice(0, count + 1);
}

function calculateGiniCoefficient(games, { topGamesCount, topGamesFraction = 1 } = {}) {
    if (!games || !games.length) {
        return null;
    }
    let topGames = getTopGamesByFraction(games, topGamesFraction);
    if (topGamesCount) {
        topGames = getTopGamesByCount(games, topGamesCount);
    }
    return gini.unordered(topGames.map(game => game.playtime));
}

module.exports = calculateGiniCoefficient;
