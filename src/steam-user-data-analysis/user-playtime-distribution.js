const { cachingWrapper } = require('../utilities');
const getUsersDataMap = require('./user-data-map');
const config = require('../config');
const getLogBinnedDistribution = require('../network-analysis/helpers/log-bin-distribution');

const binSize = config.steamData.userPlaytimeDistribution.linearBinSize
const removeTopOutliers = config.steamData.userPlaytimeDistribution.removeTopOutliers;
const binType = config.steamData.userPlaytimeDistribution.binType;

const sum = values => values.reduce((sum, curr) => sum + curr, 0);

async function calculateUserPlaytimeDistribution() {
    const userDataMap = await getUsersDataMap();
    const usersWithGameData = [...userDataMap.values()].filter(user => user.game_data === true);
    const playtimeFrequencyMap = new Map();
    for (let user of usersWithGameData) {
        const userPlaytime = Math.round(sum(user.games.map(game => game.playtime)));
        playtimeFrequencyMap.set(
            userPlaytime,
            (playtimeFrequencyMap.get(userPlaytime) || 0) + 1,
        );
    }
    return [...playtimeFrequencyMap]
        .map(([playtime, freq]) => ({ playtime, p: freq / usersWithGameData.length }))
        .sort(({ playtime: p1 }, { playtime: p2 }) => p1 - p2);;
}

function getLinearBinned(distribution) {
    const binnedPlaytimeProbabilityMap = new Map();
    const getBin = playtime => Math.floor(playtime / binSize) * binSize;
    for (let { playtime, p } of distribution) {
        const bin = getBin(playtime);
        binnedPlaytimeProbabilityMap.set(
            bin,
            (binnedPlaytimeProbabilityMap.get(bin) || 0) + p,
        );
    }
    return [...binnedPlaytimeProbabilityMap]
        .map(([binnedPlaytime, p]) => ({ playtime: binnedPlaytime, p }));
}

function getLogBinned(distribution) {
    distribution = distribution.map(({ playtime, p }) => ({ x: playtime, p }));
    let logBinned = getLogBinnedDistribution(distribution);
    return logBinned.map(({ x, p }) => ({ playtime: x, p }));
}

async function getUserPlaytimeDistribution() {
    let distribution = await cachingWrapper(
        calculateUserPlaytimeDistribution,
        'user-playtime-distributiom',
        'steam-users'
    )();
    for (let i = 0; i < removeTopOutliers; i++) {
        distribution.pop();
    }
    if (binType === 'log') {
        return getLogBinned(distribution);
    }
    return getLinearBinned(distribution);
}
module.exports = getUserPlaytimeDistribution;