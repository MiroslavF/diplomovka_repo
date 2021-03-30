const config = {
    network: {
        tableName: 'steam_edges', // 'steam_edges' or 'barabasi'
    },
    analysis: {
        degreeDistribution: {
            logBinScaleFactor: 2,
        },
        clusteringCoefficientDistribution: {
            roundCoefficients: true, 
            roundDecimalPlace: 1,
            removeTopOutliers: 0,
        },
        degreeExponent: {
            regressionType: 'LINEAR', // 'POWER' or 'LINEAR'
            cutoffs: {
                normal: {
                    method: 'outlierCount', // 'maxDeviation' or 'outlierCount'
                    maxDelta: 0.01,
                    startPositionFraction: 0.5,
                    leftOutlierCount: 5,
                    rightOutlierCount: 5,
                },
                normalLogBinned: {
                    method: 'outlierCount', // 'maxDeviation' or 'outlierCount'
                    maxDelta: 0.01,
                    startPositionFraction: 0.5,
                    leftOutlierCount: 2,
                    rightOutlierCount: 0,
                },
                cumulative: {
                    method: 'outlierCount', // 'maxDeviation' or 'outlierCount'
                    maxDelta: 0.005,
                    startPositionFraction: 0.5,
                    leftOutlierCount: 20, // 20
                    rightOutlierCount: 50, // 50
                },
                cumulativeLogBinned: {
                    method: 'outlierCount', // 'maxDeviation' or 'outlierCount'
                    maxDelta: 0.01,
                    startPositionFraction: 0.5,
                    leftOutlierCount: 0,
                    rightOutlierCount: 0,
                },
            },
        },
        hierarchicalClustering: {
            regressionType: 'LINEAR', // 'POWER' or 'LINEAR'
            cutoffs: {
                normal: {
                    leftOutlierCount: 0,
                    rightOutlierCount: 50,
                },
                logBinned: {
                    leftOutlierCount: 6,
                    rightOutlierCount: 0,
                }
            }
        },
        degreeCorrelations: {
            randomizationIterations: 1000, // need to delete cache to recalculate
        }
    },
    steamData: {
        // topGamesGiniCoefficientParameter: { topGamesCount: 10 }, // remove cache to recalculate, default to all games
        countryDistribution: {
            displayLimit: 20,
            showRest: false,
        },
        averageCommunityCountryDominancePerCountry: {
            displayLimit: 5,
        },
        mostPlayedGames: {
            displayLimit: 50,
            showRest: false,
        },
        communitySizeDistribution: {
            removeTopOutliers: 0,
        },
        userPlaytimeDistribution: {
            binType: 'log', // 'linear' or 'log'
            linearBinSize: 1,
            removeTopOutliers: 0,
        },
        networkEvolution: {
            showUserCount: true,
            showEdgeCount: true,
            userCountStepSize: 100,
            edgeCountStepSize: 400,
        },
        communityFavouriteGamesMatch: {
            maxGamesCount: 10,
        },
        usersGamesMatch: {
            maxGamesCount: 10,
        },
        communityCorrelation: {
            randomCommunitySampleIterations: 1000,
        },
        propertyCorrelations: {
            baseProperty: "communitiesMember",
            friendsCount: {
                binSize: 40,
                range: {
                    min: 1,
                    max: 800,
                }
            },
            steamLevel: {
                binSize: 50,
                range: {
                    min: 1,
                    max: 5000,
                },
            },
            gameCount: {
                binSize: 100,
                range: {
                    min: 1,
                    max: 10000,
                },
            },
            playtime: {
                binSize: 10000,
                range: {
                    min: 1,
                    max: 100000,
                },
            },
            sameCountryNeighboursFraction: {
                binSize: 0.1,
                range: {
                    min: 0,
                    max: 1,
                },
            },
            yearsRegistered: {
                binSize: 1,
                range: {
                    min: 1,
                    max: 20,
                },
            },
            communitiesMember: {
                binSize: 5,
                range: {
                    min: 0,
                    max: 60,
                },
            },
            maxJoiningCommunities: {
                binSize: 5,
                range: {
                    min: 0,
                    max: 35,
                },
            },
            topGamesGiniCoefficient: {
                binSize: 0.1,
                range: {
                    min: 0,
                    max: 1,
                },
            }
        }
    },
    barabasiModel: {
        tableName: 'barabasi',
        generate: {
            targetNodeCount: 100000,
            edgeIncrement: 4,
        },
    },
    steam: {
        startUserId: '76561198082367921', // ja
        friendsApiUrl: 'http://api.steampowered.com/ISteamUser/GetFriendList/v1/',
        apiKeys: [
            '894AD0D1504890CDBF22534B7E163C95', // ja
            '5420C2B210A8C6E9018724560D04758E', // maky
            '0C42E026DC26A58B7E7CF62FF75ECA3F', // condor
            'C1311B2AD8EE377B2DE902331C1D6609', // brano
        ],
        gamesApiUrl: 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/',
        playerSummariesApiUrl: 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
        steamLevelApiUrl: 'https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/',
        usersTable: 'steam_users',
        gamesTable: 'steam_games',
        userOwnedGamesTable: 'steam_user_owned_games',
    },
    database: {
        host: 'localhost',
        name: 'diplomovka',
        pass: '',
        port: 3306,
        user: 'root',
    },
    port: 8080,
};

module.exports = config;