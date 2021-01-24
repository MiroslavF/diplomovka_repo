const { cachingWrapper } = require('../utilities');
const getUserDataMap = require('./user-data-map');

async function calculateCommunityMembershipDistribution() {
    const userDataMap = await getUserDataMap();
    const communitiesMemberFrequencyMap = new Map();
    for (let [_, userData] of userDataMap) {
        communitiesMemberFrequencyMap.set(
            userData.communities,
            (communitiesMemberFrequencyMap.get(userData.communities) || 0) + 1
        );
    }
    return [...communitiesMemberFrequencyMap]
        .map(([communitiesMember, freq]) => ({ communitiesMember, p: freq / userDataMap.size }));

}

module.exports = cachingWrapper(calculateCommunityMembershipDistribution, 'community-membership-distribution', 'steam-users');