const { cachingWrapper } = require('../utilities');
const getCommunitySizeDistribution = require('./community-size-distribution');
const getCounts = require('./counts');


async function calculateCommunityAverages() {
    const { communityCount } = await getCounts();
    const communitySizeDistribution = await getCommunitySizeDistribution();
    let sizeSum = 0;
    for (let { size, p } of communitySizeDistribution) {
        sizeSum += size * (p * communityCount);
    }
    return {
        avgCommunitySize: sizeSum / communityCount,
    };
}

module.exports = cachingWrapper(calculateCommunityAverages, 'community-averages', 'steam-users');