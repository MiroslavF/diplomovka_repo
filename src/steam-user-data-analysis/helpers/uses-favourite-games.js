function getUsersFavouriteGames(users, topGamesCount) {
    const gameToPlaytimeMap = new Map();
    for (let user of users) {
        for (let game of user.games) {
            gameToPlaytimeMap.set(
                game.name,
                (gameToPlaytimeMap.get(game.name) || 0) + game.playtime
            );
        }
    }
    const totalPlaytime = [...gameToPlaytimeMap.values()].reduce((sum, curr) => sum + curr, 0);
    return [...gameToPlaytimeMap]
        .sort(([n1, p1], [n2, p2]) => p2 - p1)
        .slice(0, topGamesCount)
        .map(([name, playtime]) =>({ name, fraction: playtime / totalPlaytime }));
}

module.exports = getUsersFavouriteGames;