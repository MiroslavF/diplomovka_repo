const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');

async function calculateLevelDistribution(){
    const userDataMap = await getUserDataMap();
    const usersWithLevel = [...userDataMap.values()].filter(user => user.level !== null);
    const levelFrequencyMap = new Map();
    for (let { level } of usersWithLevel) {
        levelFrequencyMap.set(level, (levelFrequencyMap.get(level) || 0) + 1);
    }
    return Array.from(levelFrequencyMap.entries())
        .map(([level, freq]) => ({ level, p: freq / usersWithLevel.length }))
        .sort(({ p: p1 }, { p: p2 }) => p2 - p1);
}

module.exports = cachingWrapper(calculateLevelDistribution, 'level-distribution', 'steam-users');