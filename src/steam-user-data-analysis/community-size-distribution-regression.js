const regression = require('regression');
const getCommunitySizeDistribution = require('./community-size-distribution');

const leftOutlierCount = 0;
const rightOutlierCount = 95;

async function calculateCommunitySizeDistributionRegression() {
    const communitySizeDistribution = await getCommunitySizeDistribution();
    const slicedDistribution = communitySizeDistribution
        .slice(leftOutlierCount, communitySizeDistribution.length - rightOutlierCount);

    const data = slicedDistribution.map(({ size, p }) => [Math.log(size), Math.log(p)])
    const result = regression.linear(data, { precision: 4 });
    return { exp: result.equation[0], c: result.equation[1] };
}

module.exports = calculateCommunitySizeDistributionRegression;