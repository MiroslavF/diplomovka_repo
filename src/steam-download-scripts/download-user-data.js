const axios = require('axios');
const config = require('../config');
const database = require('../database');
const getNodeToDegreeMap = require('../network-analysis/helpers/node-to-neighbours-map');

const usersTable = config.steam.usersTable;
const playerSummariesApiUrl = config.steam.playerSummariesApiUrl;
const steamLevelApiUrl = config.steam.steamLevelApiUrl;
const apiKeys = config.steam.apiKeys;

const MAX_RETRY_COUNT = 3 * apiKeys.length;
const RETRY_INTERVAL = 1000 * 10;
const TIMEOUT = 1000 * 10;

function sleep(ms) {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function createApiKeyGenerator() {
    let requestCount = -1;
    return function() {
        requestCount++;
        return apiKeys[requestCount % apiKeys.length];
    }
}
const getNextApiKey = createApiKeyGenerator();

async function getAllUsers() {
    const nodeToDegreeMap = await getNodeToDegreeMap()
    return Array.from(nodeToDegreeMap.keys());
}

async function getPlayerSummaries(user, retryCount = 0) {
    try {
        const response = await axios.get(playerSummariesApiUrl, {
            params: {
                key: getNextApiKey(),
                steamids: user,
            },
            timeout: TIMEOUT,
        });
        if (!response.data.response.players) {
            return null;
        }
        return response.data.response.players[0];
    } catch (err) {
        console.log('ERROR=', err);
        const errStatus = err.response ? err.response.status : 500;
        const errText = err.response ? err.response.statusText : 'Unspecified (probably timed out) error';
        if (retryCount > MAX_RETRY_COUNT) {
            return null;
        }
        console.log(`Failed to get player summaries of user ${user} due to ${errText} (${errStatus}), trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        return await getPlayerSummaries(user, retryCount + 1);
    }
}

async function getSteamLevel(user, retryCount = 0) {
    try {
        const response = await axios.get(steamLevelApiUrl, {
            params: {
                key: getNextApiKey(),
                steamid: user,
            },
            timeout: TIMEOUT,
        });
        return response.data.response.player_level;
    } catch (err) {
        console.log(err);
        const errStatus = err.response ? err.response.status : 500;
        const errText = err.response ? err.response.statusText : 'Unspecified (probably timed out) error';
        if (retryCount > MAX_RETRY_COUNT) {
            return null;
        }
        console.log(`Failed to get steam level of user ${user} due to ${errText} (${errStatus}), trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        return await getSteamLevel(user, retryCount + 1);
    }
}

async function insertUserData(userData) {
    try {
        await database(usersTable).insert(userData).timeout(TIMEOUT, { cancel: true });
    } catch (err) {
        console.log(err);
        console.error(`Failed to insert user data, trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        await insertUserData(userData);
    }
}

async function download() {
    const users = await getAllUsers();
    let processedUsers = 0;
    for (let user of users) {
        let [playerSummaries, steamLevel] = await Promise.all([getPlayerSummaries(user), getSteamLevel(user)]);
        playerSummaries = playerSummaries || {};
        const userData = {
            steam_id: user,
            level: steamLevel,
            since: playerSummaries.timecreated ? new Date(playerSummaries.timecreated * 1000) : null,
            country: playerSummaries.loccountrycode || null,
        };
        await insertUserData(userData);
        processedUsers++;
        console.log(`Processed users: ${processedUsers}`);
    }
    console.log('User data successfully downloaded!')
}