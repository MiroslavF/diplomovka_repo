const axios = require('axios');
const config = require('../config');
const database = require('../database');

const startUserId = config.steam.startUserId;
const apiUrl = config.steam.friendsApiUrl;
const apiKeys = config.steam.apiKeys;
const networkTable = config.network.tableName;

const MAX_RETRY_COUNT = 3 * apiKeys.length;
const RETRY_INTERVAL = 1000 * 10;
const TIMEOUT = 1000 * 10;
const LONG_QUERY_TIMEOUT = 1000 * 60 * 60 * 2;

let requestCount = 0;

function sleep(ms) {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

function isUserUnreachable(errStatus, retryCount) {
    return (errStatus === 401 || (retryCount >= MAX_RETRY_COUNT && ![429, 503].includes(errStatus)));
}

async function getFriends(steamid, retryCount = 0) {
    try {
        const response = await axios.get(apiUrl, {
            params: {
                key: apiKeys[requestCount++ % apiKeys.length],
                steamid,
                relationship: 'friend',
            },
            timeout: TIMEOUT,
        });
        return response.data.friendslist.friends;
    } catch (err) {
        const errStatus = err.response ? err.response.status : 500;
        const errText = err.response ? err.response.statusText : 'Unspecified (probably timed out) error';
        if (isUserUnreachable(errStatus, retryCount)) {
            return [];
        }
        console.error(`Failed to get friends of user ${steamid} due to ${errText} (${errStatus}), trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        return await getFriends(steamid, retryCount + 1);
    }
};

async function insertFriendLinks(friendLinks) {
    try {
        await database(networkTable).insert(friendLinks).timeout(TIMEOUT, { cancel: true });
    } catch (err) {
        console.error(`Failed to insert friend links, trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        await insertFriendLinks(friendLinks);
    }
}

// will crash if skippedUsers size will exceed around 700 000, todo batching if larger network
async function deleteLinksToSkippedUsers(skippedUsers) {
    try {
        await database(networkTable).whereIn('b', skippedUsers).delete().timeout(LONG_QUERY_TIMEOUT);
    } catch (err) {
        console.error(`Failed to delete skipped user's links, trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        await deleteLinksToSkippedUsers(skippedUsers);
    }
}

// will crash if addedUsers size will exceed around 700 000, todo batching if larger network
async function deleteLinksToMissingUsers(addedUsers) {
    try {
        await database(networkTable).whereNotIn('b', addedUsers).delete().timeout(LONG_QUERY_TIMEOUT);
    } catch (err) {
        console.error(`Failed to delete missings user's links, trying again in ${RETRY_INTERVAL / 1000} seconds...`);
        await sleep(RETRY_INTERVAL);
        await deleteLinksToMissingUsers(addedUsers);
    }
}

async function download(targetNodeCount) {
    const addedUsers = new Set();
    const queuedUsers = [startUserId];
    const skippedUsers = [];

    while (addedUsers.size < targetNodeCount && queuedUsers.length) {
        const currentUser = queuedUsers.shift();
        const friends = await getFriends(currentUser);
        const isUserUnreachable = friends.length === 0;
        const friendLinks = [];

        for (let { steamid, friend_since} of friends) {
            if (!addedUsers.has(steamid)) {
                friendLinks.push({
                    a: currentUser,
                    b: steamid,
                    since: friend_since ? new Date(friend_since * 1000) : null,
                });
                if ((addedUsers.size + queuedUsers.length + skippedUsers.length <= 2 * targetNodeCount) && !queuedUsers.includes(steamid)) {
                    queuedUsers.push(steamid);
                }
            }
        }

        if (isUserUnreachable) {
            console.log(`Skipping unreachable user ${currentUser} ...`);
            skippedUsers.push(currentUser);
        } else {
            await insertFriendLinks(friendLinks);
            addedUsers.add(currentUser);
        }
        console.log(`Added users: ${addedUsers.size}, Skipped users: ${skippedUsers.length}, Queued users: ${queuedUsers.length}`);
    }
    console.log('Deleting links to skipped users ...');
    await deleteLinksToSkippedUsers(skippedUsers);
    console.log('Links to skipped users successfully deleted');

    console.log('Deleting links to missing users ...');
    await deleteLinksToMissingUsers(Array.from(addedUsers));
    console.log('Links to missing users successfully deleted');
    console.log('Downloading finished');
}