const database = require('../database');
const config = require('../config');
const { cachingWrapper } = require('../utilities');
const getNodeToNeighboursMap = require('../network-analysis/helpers/node-to-neighbours-map');
const getAllCommunities = require('./helpers/get-all-communities');
const getTopGamesGiniCoefficient = require('./helpers/top-games-gini-coefficient');
const getClusteringCoefficient = require('../network-analysis/helpers/clustering-coefficient');

const usersTable = config.steam.usersTable;
const userOwnedGamesTable = config.steam.userOwnedGamesTable;
const gamesTable = config.steam.gamesTable;
const topGamesGiniCoefficientParameter = config.steamData.topGamesGiniCoefficientParameter;

function calculateSameCountryNeighboursFraction(user, userDataMap) {
    const userCountry = userDataMap.get(user).country;
    if (!userCountry) {
        return null;
    }
    const neighbours = userDataMap.get(user).neighbours
    const neighboursWithCountry = neighbours.filter(neighbour => userDataMap.get(neighbour).country !== null);
    const allNeighboursHaveCountry = neighboursWithCountry.length === neighbours.length;
    if (!allNeighboursHaveCountry) {
        return null;
    }
    const neighboursWithSameCountry = neighboursWithCountry
        .filter(neighbour => userDataMap.get(neighbour).country === userCountry);
    return neighboursWithSameCountry.length / neighboursWithCountry.length;
}

async function getUserGamesData(steam_id) {
    const gamesData = await database
        .select('name', 'playtime', 'game_app_id')
        .from(userOwnedGamesTable)
        .innerJoin(gamesTable, `${userOwnedGamesTable}.game_app_id`, `${gamesTable}.app_id`)
        .where({ user_steam_id: steam_id })
    return gamesData.map(gameData => ({
         ...gameData,
         playtime: gameData.playtime / 60,
        })).sort(({ playtime: p1 }, { playtime: p2 }) => p2 - p1);
}

function calculateUserToCommunityCountMap() {
    const userToCommunityCountMap = new Map();
    const allCommunities = getAllCommunities();
    for (let kClique in allCommunities) {
        for (let community of allCommunities[kClique].communities) {
            for (let user of community) {
                userToCommunityCountMap.set(user, (userToCommunityCountMap.get(user) || 0) + 1);
            }
        }
    }
    return userToCommunityCountMap;
}

function calculateUserToMaxJoiningCommunitiesMap() {
    const userToMaxJoiningCommunitiesMap = new Map();
    const allCommunities = getAllCommunities();
    for (let kClique in allCommunities) {
        const userToCurrentCommunityCountMap = new Map();
        for (let community of allCommunities[kClique].communities) {
            for (let user of community) {
                userToCurrentCommunityCountMap.set(user, (userToCurrentCommunityCountMap.get(user) || 0) + 1);
            }
        }
        for (let user of userToCurrentCommunityCountMap.keys()) {
            userToMaxJoiningCommunitiesMap.set(
                user,
                Math.max((userToMaxJoiningCommunitiesMap.get(user) || 0), (userToCurrentCommunityCountMap.get(user) || 0)),
            );
        }
    }
    return userToMaxJoiningCommunitiesMap;
}

async function calculateUserDataMapEntries() {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const userToCommunityCountMap = calculateUserToCommunityCountMap();
    const userToMaxJoiningCommunitiesMap = calculateUserToMaxJoiningCommunitiesMap();
    let users = await database(usersTable).select();
    const userDataMap = new Map();
    for (let user of users) {
        let games = null;
        if (user.game_data) {
            games = await getUserGamesData(user.steam_id);
        }
        userDataMap.set(user.steam_id, {
            steam_id: user.steam_id,
            level: user.level,
            since: user.since,
            game_data: Boolean(user.game_data),
            country: user.country,
            neighbours: nodeToNeighboursMap.get(user.steam_id),
            games: games,
            communities: userToCommunityCountMap.get(user.steam_id) || 0,
            maxJoiningCommunities: userToMaxJoiningCommunitiesMap.get(user.steam_id) || 0,
            topGamesGiniCoefficient: getTopGamesGiniCoefficient(games, topGamesGiniCoefficientParameter),
            clusteringCoefficient: getClusteringCoefficient(user.steam_id, nodeToNeighboursMap),
        });
    }
    for (let [user, data] of userDataMap) {
        data.sameCountryNeighboursFraction = calculateSameCountryNeighboursFraction(user, userDataMap);
    }
    return [...userDataMap];
}

async function calculateUserDataMap() {
    const nodeToNeighboursMapEntries = await cachingWrapper(calculateUserDataMapEntries, 'user-data-map-entries', 'steam-users')();
    return new Map(nodeToNeighboursMapEntries);
}
module.exports = calculateUserDataMap;