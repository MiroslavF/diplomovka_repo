const axios = require('axios');
const config = require('../config');
const database = require('../database');

const gamesTable = config.steam.gamesTable;
const userOwnedGamesTable = config.steam.userOwnedGamesTable;
const usersTable = config.steam.usersTable;
const apiUrl = config.steam.gamesApiUrl;
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

async function getUsersWithoutData() {
    const rows = await database(usersTable).where({ game_data: false }).select('steam_id');
    return rows.map(row => row.steam_id).sort(() => Math.random() - 0.5);
}

async function getGamesAppIds() {
    const rows = await database(gamesTable).select('app_id');
    return new Set(rows.map(row => row.app_id));
}

async function getOwnedGames(user, retryCount = 0) {
    try {
        const response = await axios.get(apiUrl, {
            params: {
                key: getNextApiKey(),
                steamid: user,
                include_appinfo: true,
                include_played_free_games: true
            },
            timeout: TIMEOUT,
        });
        return response.data.response.games || null;
    } catch (err) {
        const errStatus = err.response ? err.response.status : 500;
        const errText = err.response ? err.response.statusText : 'Unspecified (probably timed out) error';
        if (retryCount > MAX_RETRY_COUNT) {
            console.log(`Skipping user '${user}' ...`)
            return null;
        }
        console.log(`Failed to get owned games of user ${user} due to ${errText} (${errStatus}), trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        return await getOwnedGames(user, retryCount + 1);
    }
}

function removeUnsupportedChars(name) {
    const allowedChars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:/'|" _-,.()*+-{}%&$@!?#[]<>~;€`;
    return name.split("").filter(ch => allowedChars.includes(ch)).join("");
}

async function insertGame(game, retry = false){
    const gameData = retry ? game : ({ app_id: game.appid, name: removeUnsupportedChars(game.name) });
    try {
        await database(gamesTable).insert(gameData).timeout(TIMEOUT, { cancel: true });
    } catch (err) {
        console.log(err);
        console.error(`Failed to insert game data, trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        await insertGame(gameData, true);
    }
}

async function insertUserOwnedGames(user, games) {
    const data = games.map(game => ({
        user_steam_id: user,
        game_app_id: game.appid,
        playtime: game.playtime_forever,
    }));
    try {
        await database(userOwnedGamesTable).insert(data).timeout(TIMEOUT, { cancel: true });
    } catch (err) {
        console.log(err);
        console.error(`Failed to insert user owner games, trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        await insertUserOwnedGames(user, games);
    }
}

async function markUserDataAsAvailable(user) {
    try {
        await database(usersTable)
            .where({ steam_id: user })
            .update({ game_data: true });
    } catch (err) {
        console.log(err);
        console.error(`Failed to mark user data as available, trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        await markUserDataAsAvailable(user);
    }
}

async function download() {
    const users = await getUsersWithoutData();
    const insertedGameIds = await getGamesAppIds();
    let processedUsers = 0;
    let downloadedUsers = 0;
    for (let user of users) {
        const ownedGames = await getOwnedGames(user);
        let userOwnedGamesToInsert = [];
        if (!ownedGames || !ownedGames.length) {
            processedUsers++;
            console.log(`Processed users = ${processedUsers}, Downloaded users = ${downloadedUsers}, Inserted games = ${insertedGameIds.size}`);
            continue;
        }
        for (let game of ownedGames) {
            if (game.playtime_forever > 60) { // minutes
                if (!insertedGameIds.has(game.appid)) {
                    await insertGame(game);
                    insertedGameIds.add(game.appid);
                }
                userOwnedGamesToInsert.push(game);
            }
        }
        if (!userOwnedGamesToInsert.length) {
            processedUsers++;
            console.log(`Processed users = ${processedUsers}, Downloaded users = ${downloadedUsers}, Inserted games = ${insertedGameIds.size}`);
            continue;
        }
        await Promise.all([
            insertUserOwnedGames(user, userOwnedGamesToInsert),
            markUserDataAsAvailable(user),
        ]);
        downloadedUsers++;
        processedUsers++;
        console.log(`Processed users = ${processedUsers}, Downloaded users = ${downloadedUsers}, Inserted games = ${insertedGameIds.size}`);
    }
    console.log('User game data successfully downloaded!')
}
download();
