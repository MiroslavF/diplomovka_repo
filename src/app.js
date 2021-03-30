const express = require('express');
const mustacheExpress = require('mustache-express');
const iso3166 = require('iso-3166-2');
const config = require('./config');
const {
    getNodeCount,
    getEdgeCount,
    getAverageNodeDegree,
    getNormalDegreeDistribution,
    getNormalLogBinnedDegreeDistribution,
    getCumulativeDegreeDistribution,
    getDistanceDistribution,
    getDiameter,
    getAverageDistance,
    getClusteringCoefficientDistribution,
    getAverageClusteringCoefficient,
    getHierarchicalClustering,
    getLogBinnedHierarchicalClustering,
    getHierarchicalClusteringRegression,
    getCumulativeLogBinnedDegreeDistribution,
    getDegreeExponents,
    getDegreeCorrelations,
    getRandomizedDegreeCorrelations,
} = require('./network-analysis');

const getUserDataMap = require('./steam-user-data-analysis/user-data-map');
const getCounts = require('./steam-user-data-analysis/counts');
const getUsersAverages = require('./steam-user-data-analysis/users-averages');
const getLevelDistribution = require('./steam-user-data-analysis/level-distribution');
const getGameData = require('./steam-user-data-analysis/game-data');
const getGamesAverages = require('./steam-user-data-analysis/games-averages');
const getCountryDistribution = require('./steam-user-data-analysis/country-distribution');
const getGamePlaytimeDistribution = require('./steam-user-data-analysis/game-playtime-distribution');
const getCommunitiesWithAvailableGameData = require('./steam-user-data-analysis/communities-with-available-game-data');
const getCommunitiesWithAvailableCountryData = require('./steam-user-data-analysis/communities-with-available-country-data');
const getAverageSameCountryNeighbourFractionPerK = require('./steam-user-data-analysis/average-same-country-neighbour-fraction-per-k');
const getAverageSameCountryNeighbourFractionPerCountry = require('./steam-user-data-analysis/average-same-country-neighbour-fraction-per-country');
const getAverageCommunityCountryDominance = require('./steam-user-data-analysis/average-community-country-dominance');
const getAverageCommunityCountryDominancePerCountry = require('./steam-user-data-analysis/average-community-country-dominance-per-country');
const getCommunitySizeDistribution = require('./steam-user-data-analysis/community-size-distribution');
const getAverageCommunitySizePerDominantCountry = require('./steam-user-data-analysis/average-community-size-per-dominant-country');
const getCommunityAverages = require('./steam-user-data-analysis/community-averages');
const getCommunityMembershipDistribution = require('./steam-user-data-analysis/community-membership-distribution');
const getUserPlaytimeDistribution = require('./steam-user-data-analysis/user-playtime-distribution');
const getPropertyCorrelations = require('./steam-user-data-analysis/property-correlations');
const getNetworkEvolution = require('./steam-user-data-analysis/network-evolution');
const getCommunityFavouriteGamesMatch = require('./steam-user-data-analysis/community-favourite-games-match');
const getUsersGamesMatch = require('./steam-user-data-analysis/users-games-match');
const getCommunityCorrelations = require('./steam-user-data-analysis/community-correlations');


const port = config.port;

const app = express();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.use('/chart', express.static(`${__dirname}/../node_modules/chart.js/dist/Chart.bundle.js`));
app.use('/axios', express.static(`${__dirname}/../node_modules/axios/dist/axios.js`));

app.use(express.static(`${__dirname}/frontend`));

app.get('/degree-distribution', async (req, res) => {
    const logBinScaleFactor = config.analysis.degreeDistribution.logBinScaleFactor;
    const normal = await getNormalDegreeDistribution();
    const normalLogBinned = await getNormalLogBinnedDegreeDistribution();
    const cumulative = await getCumulativeDegreeDistribution();
    const cumulativeLogBinned = await getCumulativeLogBinnedDegreeDistribution();
    const averageNodeDegree = await getAverageNodeDegree();
    res.json({
        normal,
        normalLogBinned,
        logBinScaleFactor,
        cumulative,
        cumulativeLogBinned,
        averageNodeDegree,
    });
});

app.get('/distance-distribution', async (req, res) => {
    const distanceDistribution = await getDistanceDistribution();
    const averageDistance = await getAverageDistance();
    res.json({ distanceDistribution, averageDistance: averageDistance.toFixed(4) });
});

app.get('/clustering-coefficient-distribution', async (req, res) => {
    const clusteringCoefficientDistribution = await getClusteringCoefficientDistribution();
    const averageClusteringCoefficient = await getAverageClusteringCoefficient();
    res.json({
        clusteringCoefficientDistribution,
        averageClusteringCoefficient: averageClusteringCoefficient.toFixed(4),
    });
});

app.get('/hierarchical-clustering', async (req, res) => {
    const hierarchicalClustering = await getHierarchicalClustering();
    const logBinnedHierarchicalClustering = await getLogBinnedHierarchicalClustering();
    const hierarchicalClusteringRegression = await getHierarchicalClusteringRegression();
    const regressionType = config.analysis.hierarchicalClustering.regressionType;
    res.json({
        hierarchicalClustering,
        logBinnedHierarchicalClustering,
        hierarchicalClusteringRegression,
        regressionType,
    });
});

app.get('/degree-exponents', async (req, res) => {
    const degreeExponents = await getDegreeExponents();
    const normal = await getNormalDegreeDistribution();
    const normalLogBinned = await getNormalLogBinnedDegreeDistribution();
    const cumulative = await getCumulativeDegreeDistribution();
    const cumulativeLogBinned = await getCumulativeLogBinnedDegreeDistribution();
    const regressionType = config.analysis.degreeExponent.regressionType;
    res.json({
        degreeExponents,
        normal,
        normalLogBinned,
        cumulative,
        cumulativeLogBinned,
        regressionType,
    });
});

app.get('/degree-correlations', async (req, res) => {
    const degreeCorrelations = await getDegreeCorrelations();
    const randomizedDegreeCorrelations = await getRandomizedDegreeCorrelations();
    res.json({
        degreeCorrelations,
        randomizedDegreeCorrelations,
    });
});

app.get('/', async (req, res) => {
    const nodeCount = await getNodeCount();
    const edgeCount = await getEdgeCount();
    const averageNodeDegree = await getAverageNodeDegree();
    const diameter = await getDiameter();
    const averageDistance = await getAverageDistance();
    const averageClusteringCoefficient = await getAverageClusteringCoefficient();
    const degreeExponents = await getDegreeExponents();

    res.render(`${__dirname}/frontend/index`, {
        nodeCount,
        edgeCount,
        averageNodeDegree: averageNodeDegree.toFixed(4),
        diameter,
        averageDistance: averageDistance.toFixed(4),
        averageClusteringCoefficient: averageClusteringCoefficient.toFixed(4),
        degreeExponentFromMaxDegree: degreeExponents.fromMaxDegree.toFixed(4),
        degreeExponentMaximumLikelihood: degreeExponents.maximumLikelihood.toFixed(4)
    });
});

app.get('/country-distribution', async (req, res) => {
    let countryDistribution = await getCountryDistribution();
    countryDistribution = countryDistribution
        .map(({ country, p }) => ({ country: (iso3166.country(country) || { name: country }).name, p }));

    const displayLimit = config.steamData.countryDistribution.displayLimit;
    const showRest = config.steamData.countryDistribution.showRest;
    res.json({ countryDistribution, displayLimit, showRest });
});

app.get('/most-played-games', async (req, res) => {
    const games = await getGameData();
    const displayLimit = config.steamData.mostPlayedGames.displayLimit;
    const showRest = config.steamData.mostPlayedGames.showRest;
    res.json({ games, displayLimit, showRest });
});

app.get('/game-playtime-distribution', async (req, res) => {
    const gamePlaytimeDistribution = await getGamePlaytimeDistribution();
    const { totalPlaytime } = await getCounts();
    const { avgGamePlaytime } = await getGamesAverages();
    const avgPlaytimeFraction = avgGamePlaytime / totalPlaytime;
    res.json({ gamePlaytimeDistribution, avgPlaytimeFraction });
});

app.get('/community-size-distribution', async (req, res) => {
    const communitySizeDistribution = await getCommunitySizeDistribution();
    const { avgCommunitySize } = await getCommunityAverages();
    res.json({ communitySizeDistribution, avgCommunitySize: avgCommunitySize.toFixed(4) });
});

app.get('/community-membership-distribution', async (req, res) => {
    const communityMembershipDistribution = await getCommunityMembershipDistribution();
    const { avgCommunitiesMember } = (await getUsersAverages()).allUsers;
    res.json({ communityMembershipDistribution, avgCommunitiesMember });
});

app.get('/user-playtime-distribution', async (req, res) => {
    const userPlaytimeDistribution = await getUserPlaytimeDistribution();
    res.json({ userPlaytimeDistribution });
})

app.get('/property-correlations', async (req, res) => {
    const baseProperty = config.steamData.propertyCorrelations.baseProperty;
    const propertyCorrelations = await getPropertyCorrelations(baseProperty);
    res.json({ baseProperty, propertyCorrelations });
})

app.get('/network-evolution', async (req, res) => {
    const networkEvolution = await getNetworkEvolution();
    const { showUserCount, showEdgeCount } = config.steamData.networkEvolution;
    const userCountStepSize = config.steamData.networkEvolution.userCountStepSize;
    const edgeCountStepSize = config.steamData.networkEvolution.edgeCountStepSize;
    networkEvolution.usersDates = networkEvolution.usersDates.filter((_, index) => index % userCountStepSize === 0);
    networkEvolution.edgesDates = networkEvolution.edgesDates.filter((_, index) => index % edgeCountStepSize === 0);
    res.json({ networkEvolution, showUserCount, showEdgeCount });
})

app.get('/community-favourite-games-match', async (req, res) => {
    const communityFavouriteGamesMatch = await getCommunityFavouriteGamesMatch();
    res.json({ communityFavouriteGamesMatch });
});

app.get('/users-games-match', async (req, res) => {
    const usersGamesMatch = await getUsersGamesMatch();
    res.json({ usersGamesMatch });
});

app.get('/steam', async (req, res) => {
    const {
        playerCount,
        gameCount,
        totalPlaytime,
        availableCountryPlayerCount,
        availableGameDataPlayerCount,
        communityCount,
        countryCount,
        availableCountryCommunityCount,
        availableGameDataCommunityCount,
        playersWithoutCommunityCount,
    } = await getCounts();

    const {
        avgFriendsCount,
        avgSteamLevel,
        avgGameCount,
        avgPlaytime,
        avgSameCountryNeighboursFraction,
        avgYearsRegistered,
        avgCommunitiesMember,
        avgMaxJoiningCommunities,
        avgGamesGiniCoefficient,
        avgClusteringCoefficient,
    } = (await getUsersAverages()).allUsers;

    const {
        avgFriendsCount: avgFriendsCountNoCommunity,
        avgSteamLevel: avgSteamLevelNoCommunity,
        avgGameCount: avgGameCountNoCommunity,
        avgPlaytime: avgPlaytimeNoCommunity,
        avgSameCountryNeighboursFraction: avgSameCountryNeighboursFractionNoCommunity,
        avgYearsRegistered: avgYearsRegisteredNoCommunity,
        avgCommunitiesMember: avgCommunitiesMemberNoCommunity,
        avgMaxJoiningCommunities: avgMaxJoiningCommunitiesNoCommunity,
        avgGamesGiniCoefficient: avgGamesGiniCoefficientNoCommunity,
        avgClusteringCoefficient: avgClusteringCoefficientNoCommunity
    } = (await getUsersAverages()).withoutCommunity;

    const {
        avgFriendsCount: avgFriendsCountMostCommunities,
        avgSteamLevel: avgSteamLevelMostCommunities,
        avgGameCount: avgGameCountMostCommunities,
        avgPlaytime: avgPlaytimeMostCommunities,
        avgSameCountryNeighboursFraction: avgSameCountryNeighboursFractionMostCommunities,
        avgYearsRegistered: avgYearsRegisteredMostCommunities,
        avgCommunitiesMember: avgCommunitiesMemberMostCommunities,
        avgMaxJoiningCommunities: avgMaxJoiningCommunitiesMostCommunities,
        avgGamesGiniCoefficient: avgGamesGiniCoefficientMostCommunities,
        avgClusteringCoefficient: avgClusteringCoefficientMostCommunities
    } = (await getUsersAverages()).mostCommunities;

    const {
        avgGamePlaytime,
        avgGameUserCount,
    } = await getGamesAverages();

    const {
        realCommunityAveragedDeviations: {
            friendsCount: friendsCountAverageRSD,
            steamLevel: steamLevelAverageRSD,
            gameCount: gameCountAverageRSD,
            playtime: playtimeAverageRSD,
            yearsRegistered: yearsRegisteredAverageRSD,
            communitiesMember: communitiesMemberAverageRSD,
            maxJoiningCommunities: maxJoiningCommunitiesAverageRSD,
            topGamesGiniCoefficient: topGamesGiniCoefficientAverageRSD,
        },
        higherValuePercentage: {
            friendsCount: friendsCountHiigherValuePercentage,
            steamLevel: steamLevelHiigherValuePercentage,
            gameCount: gameCountHigherValuePercentage,
            playtime: friendsCountHigherValuePercentage,
            yearsRegistered: yearsRegisteredHigherValuePercentage,
            communitiesMember: communitiesMemberHigherValuePercentage,
            maxJoiningCommunities: maxJoiningCommunitiesHigherValuePercentage,
            topGamesGiniCoefficient: topGamesGiniCoefficientHigherValuePercentage,
        },
    } = await getCommunityCorrelations();
    const randomCommunitySampleIterations = config.steamData.communityCorrelation.randomCommunitySampleIterations;

    const averageCommunityCountryDominance = await getAverageCommunityCountryDominance();

    const averageCommunityCountryDominancePerCountry = await getAverageCommunityCountryDominancePerCountry();
    let displayLimit = config.steamData.averageCommunityCountryDominancePerCountry.displayLimit;

    res.render(`${__dirname}/frontend/steam-data`, {
        playerCount,
        availableCountryPlayerCount,
        availableGameDataPlayerCount,
        gameCount,
        totalPlaytime,
        countryCount,
        communityCount,
        availableCountryCommunityCount,
        availableGameDataCommunityCount,
        playersWithoutCommunityCount,

        avgFriendsCount: avgFriendsCount.toFixed(4),
        avgSteamLevel: avgSteamLevel.toFixed(4),
        avgGameCount: avgGameCount.toFixed(4),
        avgPlaytime: avgPlaytime.toFixed(4),
        avgSameCountryNeighboursFraction: avgSameCountryNeighboursFraction.toFixed(4),
        avgYearsRegistered: avgYearsRegistered.toFixed(4),
        avgCommunitiesMember: avgCommunitiesMember.toFixed(4),
        avgMaxJoiningCommunities: avgMaxJoiningCommunities.toFixed(4),
        avgGamesGiniCoefficient: avgGamesGiniCoefficient.toFixed(4),
        avgClusteringCoefficient: avgClusteringCoefficient.toFixed(4),

        avgFriendsCountNoCommunity: avgFriendsCountNoCommunity.toFixed(4),
        avgSteamLevelNoCommunity: avgSteamLevelNoCommunity.toFixed(4),
        avgGameCountNoCommunity: avgGameCountNoCommunity.toFixed(4),
        avgPlaytimeNoCommunity: avgPlaytimeNoCommunity.toFixed(4),
        avgSameCountryNeighboursFractionNoCommunity: avgSameCountryNeighboursFractionNoCommunity.toFixed(4),
        avgYearsRegisteredNoCommunity: avgYearsRegisteredNoCommunity.toFixed(4),
        avgCommunitiesMemberNoCommunity: avgCommunitiesMemberNoCommunity.toFixed(4),
        avgMaxJoiningCommunitiesNoCommunity: avgMaxJoiningCommunitiesNoCommunity.toFixed(4),
        avgGamesGiniCoefficientNoCommunity: avgGamesGiniCoefficientNoCommunity.toFixed(4),
        avgClusteringCoefficientNoCommunity: avgClusteringCoefficientNoCommunity.toFixed(4),

        avgFriendsCountMostCommunities: avgFriendsCountMostCommunities.toFixed(4),
        avgSteamLevelMostCommunities: avgSteamLevelMostCommunities.toFixed(4),
        avgGameCountMostCommunities: avgGameCountMostCommunities.toFixed(4),
        avgPlaytimeMostCommunities: avgPlaytimeMostCommunities.toFixed(4),
        avgSameCountryNeighboursFractionMostCommunities: null,
        avgYearsRegisteredMostCommunities: avgYearsRegisteredMostCommunities.toFixed(4),
        avgCommunitiesMemberMostCommunities: avgCommunitiesMemberMostCommunities.toFixed(4),
        avgMaxJoiningCommunitiesMostCommunities: avgMaxJoiningCommunitiesMostCommunities.toFixed(4),
        avgGamesGiniCoefficientMostCommunities: avgGamesGiniCoefficientMostCommunities.toFixed(4),
        avgClusteringCoefficientMostCommunities: avgClusteringCoefficientMostCommunities.toFixed(4),

        avgGamePlaytime: avgGamePlaytime.toFixed(4),
        avgGameUserCount: avgGameUserCount.toFixed(4),

        averageCommunityCountryDominance: averageCommunityCountryDominance.toFixed(4) * 100,
        averageCommunityCountryDominancePerCountry: averageCommunityCountryDominancePerCountry
            .slice(0, displayLimit)
            .map(({ country, average }) => ({ country: (iso3166.country(country) || { name: country }).name, average: average.toFixed(4) })),

        friendsCountAverageRSD: friendsCountAverageRSD.toFixed(2),
        steamLevelAverageRSD: steamLevelAverageRSD.toFixed(2),
        gameCountAverageRSD: gameCountAverageRSD.toFixed(2),
        playtimeAverageRSD: playtimeAverageRSD.toFixed(2),
        yearsRegisteredAverageRSD: yearsRegisteredAverageRSD.toFixed(2),
        communitiesMemberAverageRSD: communitiesMemberAverageRSD.toFixed(2),
        maxJoiningCommunitiesAverageRSD: maxJoiningCommunitiesAverageRSD.toFixed(2),
        topGamesGiniCoefficientAverageRSD: topGamesGiniCoefficientAverageRSD.toFixed(2),

        friendsCountHiigherValuePercentage: friendsCountHiigherValuePercentage.toFixed(2),
        steamLevelHiigherValuePercentage: steamLevelHiigherValuePercentage.toFixed(2),
        gameCountHigherValuePercentage: gameCountHigherValuePercentage.toFixed(2),
        friendsCountHigherValuePercentage: friendsCountHigherValuePercentage.toFixed(2),
        yearsRegisteredHigherValuePercentage: yearsRegisteredHigherValuePercentage.toFixed(2),
        communitiesMemberHigherValuePercentage: communitiesMemberHigherValuePercentage.toFixed(2),
        maxJoiningCommunitiesHigherValuePercentage: maxJoiningCommunitiesHigherValuePercentage.toFixed(2),
        topGamesGiniCoefficientHigherValuePercentage: topGamesGiniCoefficientHigherValuePercentage.toFixed(2),

        randomCommunitySampleIterations,
    })
});

// recalculate - remove json files from cache
(async () => {
    // await getUserDataMap();
    // await getCounts();
    // await getUsersAverages();
    // await getLevelDistribution();
    // await getGameData();
    // await getGamesAverages();
    // await getCountryDistribution();
    // await getGamePlaytimeDistribution();
    // await getCommunitiesWithAvailableGameData();
    // await getCommunitiesWithAvailableCountryData();
    // await getAverageSameCountryNeighbourFractionPerK();
    // await getAverageSameCountryNeighbourFractionPerCountry();
    // await getAverageCommunityCountryDominance();
    // await getAverageCommunityCountryDominancePerCountry();
    // await getCommunitySizeDistribution();
    // await getAverageCommunitySizePerDominantCountry();
    // await getCommunityAverages();
    // await getCommunityMembershipDistribution();
    // await getUserPlaytimeDistribution();
    // await getNetworkEvolution();
    // await getCommunityFavouriteGamesMatch()
    // await getCommunityCorrelations();
    // await getRandomizedDegreeCorrelations();
    // await getUsersGamesMatch();
})();

app.listen(port, () => console.log(`App listening on port ${port}!`));