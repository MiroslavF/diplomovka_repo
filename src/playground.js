const getNodeToNeighboursMap = require('./network-analysis/helpers/node-to-neighbours-map');
const getUserDataMap = require('./steam-user-data-analysis/user-data-map');
const getCommunitiesWithAvailableGameData = require('./steam-user-data-analysis/communities-with-available-game-data');
const calculateGiniCoefficient = require('./steam-user-data-analysis/helpers/top-games-gini-coefficient');
const getUsersFavouriteGames = require('./steam-user-data-analysis/helpers/uses-favourite-games');

async function getNeighbourDegreesFrequencies(node) {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const neighbours = nodeToNeighboursMap.get(node);
    const degrees = neighbours.map(n => nodeToNeighboursMap.get(n).length);
    const frequencyMap = new Map();
    for (let degree of degrees) {
        frequencyMap.set(degree, (frequencyMap.get(degree) || 0) + 1);
    }
    return Array.from(frequencyMap.entries()).sort(([d1, freq1], [d2, freq2]) => freq1 - freq2);
}


async function getUsersWithDegree(k) {
    const userDataMap = await getUserDataMap();
    return [...userDataMap.values()].filter(user => user.neighbours.length ===k);
}

async function getUsersByCountryCode(country) {
    const userDataMap = await getUserDataMap();
    return [...userDataMap.values()].filter(user => user.country === country);
}

const getTotalPlaytime = (user) => user.games.reduce((sum, game) => sum + game.playtime, 0);

async function getUsersWithMostJoiningCommunities(count) {
    const userDataMap = await getUserDataMap();
    const result = [...userDataMap.values()]
        .filter(user => user.game_data === true)
        .sort(({ maxJoiningCommunities: c1 }, { maxJoiningCommunities: c2}) => c2 - c1).slice(0, count);
    
    const getTotalPlaytime = (user) => user.games.reduce((sum, game) => sum + game.playtime, 0);

    return result.map(user => ({
        ...user,
        neighbours: user.neighbours.length,
        games: user.games
            .sort((g1, g2) => g2.playtime - g1.playtime)
            .slice(0,10)
            .map(game => `${game.name} (${(game.playtime / getTotalPlaytime(user)).toFixed(2) * 100}%)`)
            .join(" | "),
        totalPlaytime: user.games.reduce((sum, game) => sum + game.playtime, 0),
        giniCoefficient: calculateGiniCoefficient(user.games, { topGamesCount: 3 }),
    }));
}

async function printCommunitiesWithGameDataUsers() {
    const userDataMap = await getUserDataMap(); 
    const communities = await getCommunitiesWithAvailableGameData();

    for (let community of communities) {
        for (let user of community) {
            const userData = userDataMap.get(user);
            console.log({
                k: userData.neighbours.length,
                totalPlaytime: getTotalPlaytime(userData),
                gameCount: userData.games.length,
                games: userData.games
                    .sort((g1, g2) => g2.playtime - g1.playtime)
                    .slice(0,10)
                    .map(game => `${game.name} (${(game.playtime / getTotalPlaytime(userData)).toFixed(2) * 100}%)`)
                    .join(" | "),
                country: userData.country,
            });
        }
        console.log('=======================COMMUNITY===================================');
    }
}

async function randomshit() {
    const sum = values => values.reduce((sum, curr) => sum + curr, 0);

    function calculateAverage(values) {
        return sum(values) / values.length;
    }
    const userDataMap = await getUserDataMap();
    const usersWithGames = [...userDataMap.values()].filter(user => user.game_data === true && user.games.length);
    const usersWithoutCommunities = usersWithGames.filter(user => user.communities === 0);
    const mostCommunities = usersWithGames
        .filter(user => user.maxJoiningCommunities >= 10)
        .sort(({ maxJoiningCommunities: c1 }, { maxJoiningCommunities: c2}) => c2 - c1);

    const arg = { topGamesCount: 5 };
    // const arg = { topGamesFraction: 0.95 };

    const avgGiniAll = calculateAverage(usersWithGames
        .map(user => calculateGiniCoefficient(user.games, arg))
    )
    const avgGiniNoCommunity = calculateAverage(usersWithoutCommunities
        .map(user => calculateGiniCoefficient(user.games, arg))
    )

    const avgGiniMostCommunities = calculateAverage(mostCommunities
        .map(user => calculateGiniCoefficient(user.games, arg))
    )

    console.log('avgGiniAll=,', avgGiniAll)
    console.log('avgGiniNoCommunity=,', avgGiniNoCommunity)
    console.log('avgGiniMostCommunities=,', avgGiniMostCommunities)

    console.log('Favourite games all:')
    console.log(getUsersFavouriteGames(usersWithGames, 20));

    console.log('Favourite games no community:')
    console.log(getUsersFavouriteGames(usersWithoutCommunities, 20));

    console.log('Favourite games most communities:')
    console.log(getUsersFavouriteGames(mostCommunities, 20));
}

async function getMaxDistanceFromStartNode() {
    const startNode = '76561198082367921';
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const queue = [[startNode, 0]];
    const visited = new Set();
    const queuedNodes = new Set();
    let maxDist = 0;
    while (queue.length) {
        const [current, dist] = queue.shift();
        maxDist = Math.max(maxDist, dist);
        visited.add(current);
        const neighbours = nodeToNeighboursMap.get(current);
        for (let neighbour of neighbours) {
            if (!visited.has(neighbour) && !queuedNodes.has(neighbour)) {
                queue.push([neighbour, dist + 1]);
                queuedNodes.add(neighbour);
            }
        }
    }
    console.log({ maxDist });
}

async function getMaxClusteringUsersFavoriteGames() {
    const userDataMap = await getUserDataMap();
    const allUsers = [...userDataMap.values()].filter(user => user.game_data);
    const usersWithClustering0 = allUsers.filter(user => user.clusteringCoefficient === 0);
    const usersWithClustering1 = allUsers.filter(user => user.clusteringCoefficient === 1);
    console.log(getUsersFavouriteGames(usersWithClustering0, 10));
    console.log(getUsersFavouriteGames(usersWithClustering1, 10));
}

(async () => {
    const users = (await getUsersWithDegree(1)).filter(user => user.game_data);;
    console.log(getUsersFavouriteGames(users, 20));
})()