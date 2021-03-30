const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');
const calculateUsersAverages = require('./helpers/calculate-users-averages');

async function getUsersAverages() {
    const userDataMap = await getUserDataMap();
    const allUsers = [...userDataMap.values()];
    const usersWithoutCommunity = allUsers.filter(user => user.communities === 0);
    // const usersWithMostCommunities = allUsers.filter(user => user.maxJoiningCommunities >= 10);
    const usersWithMostCommunities = allUsers.filter(user => user.communities >= 30);
    const usersWithClustering0 = allUsers.filter(user => user.clusteringCoefficient === 0);
    const usersWithClustering1 = allUsers.filter(user => user.clusteringCoefficient === 1);
    return {
        allUsers: calculateUsersAverages(allUsers),
        withoutCommunity: calculateUsersAverages(usersWithoutCommunity),
        mostCommunities: calculateUsersAverages(usersWithMostCommunities),
        noClustering: calculateUsersAverages(usersWithClustering0),
        maxClustering: calculateUsersAverages(usersWithClustering1),
    };
}
module.exports = cachingWrapper(getUsersAverages, 'users-averages', 'steam-users');