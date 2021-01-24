const { cachingWrapper } = require('../utilities');
const getAllCommunities = require('./helpers/get-all-communities');
const config = require('../config');

async function calculateCommunitySizeDistribution() {
    const allCommunities = await getAllCommunities();
    let totalCommunityCount = 0;
    const communitySizeFrequencyMap = new Map();
    for (let kClique in allCommunities) {
        totalCommunityCount += allCommunities[kClique].communities.length;
        for (let community of allCommunities[kClique].communities) {
            communitySizeFrequencyMap.set(
                community.length,
                (communitySizeFrequencyMap.get(community.length) || 0) + 1,
            );
        }
    }
    return [...communitySizeFrequencyMap]
        .map(([size, count]) =>({ size, p: count / totalCommunityCount }))
        .sort(({ size: s1 }, { size: s2 }) => s2 - s1);
}


async function getCommunitySizeDistribution() {
    const communitySizeDistribution = await cachingWrapper(calculateCommunitySizeDistribution, 'community-size-distribution', 'steam-users')();
    const removeTopOutliers = config.steamData.communitySizeDistribution.removeTopOutliers;
    return communitySizeDistribution.slice(removeTopOutliers);
}
module.exports = getCommunitySizeDistribution;