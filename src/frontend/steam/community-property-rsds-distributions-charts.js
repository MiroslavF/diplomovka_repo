const friendsCountRSDDistributionCanvas = document.getElementById('friendsCountRSDDistribution');
const gameCountRSDDistributionCanvas = document.getElementById('gameCountRSDDistribution');
const playtimeRSDDistributionCanvas = document.getElementById('playtimeRSDDistribution');
const yearsRegisteredRSDDistributionCanvas = document.getElementById('yearsRegisteredRSDDistribution');
const communitiesMemberRSDDistributionCanvas = document.getElementById('communitiesMemberRSDDistribution');
const topGamesGiniCoefficientRSDDistributionCanvas = document.getElementById('topGamesGiniCoefficientRSDDistribution');

function sum(values) {
    return values.reduce((currSum, value) => currSum + value, 0);
}

function getMaxY(dataPoints) {
    const maxY = dataPoints.reduce((currMax, curr) => Math.max(currMax, curr.y), 0);
    return maxY + 50 - (maxY % 50);
}


axios.get(`${apiUrl}/community-correlations`).then((response) => {
    const {
        realCommunitiesAveragedDeviations,
        generatedCommunities,
    } = response.data;

    function getPercentile(property, RSDsWithCounts) {
        const targetValue = realCommunitiesAveragedDeviations[property];
        const totalCount = sum(RSDsWithCounts.map(({ count }) => count));
        const belowCount = sum(
            RSDsWithCounts
                .filter(({ RSD }) => RSD < targetValue)
                .map(({ count }) => count)
        )
        return ((belowCount / totalCount) * 100).toFixed(2);
    }

    const chartOptionsObjects = [
        {
            canvas: friendsCountRSDDistributionCanvas,
            label: `a) Počet priateľov pa = ${getPercentile('friendsCount', generatedCommunities.friendsCount)}`,
            dataPoints: generatedCommunities.friendsCount.map(({ RSD, count }) => ({ x: RSD, y: count })),
            realRSD: realCommunitiesAveragedDeviations.friendsCount,
        },
        {
            canvas: gameCountRSDDistributionCanvas,
            label: `b) Počet hier pb = ${getPercentile('gameCount', generatedCommunities.gameCount)}`,
            dataPoints: generatedCommunities.gameCount.map(({ RSD, count }) => ({ x: RSD, y: count })),
            realRSD: realCommunitiesAveragedDeviations.gameCount,
        },
        {
            canvas: playtimeRSDDistributionCanvas,
            label: `c) Počet odohratých hodín pc= ${getPercentile('playtime', generatedCommunities.playtime)}`,
            dataPoints: generatedCommunities.playtime.map(({ RSD, count }) => ({ x: RSD, y: count })),
            realRSD: realCommunitiesAveragedDeviations.playtime,
        },
        {
            canvas: yearsRegisteredRSDDistributionCanvas,
            label: `d) Doba od registrácie pd = ${getPercentile('yearsRegistered', generatedCommunities.yearsRegistered)}`,
            dataPoints: generatedCommunities.yearsRegistered.map(({ RSD, count }) => ({ x: RSD, y: count })),
            realRSD: realCommunitiesAveragedDeviations.yearsRegistered,
        },
        {
            canvas: communitiesMemberRSDDistributionCanvas,
            label: `e) Počet komunít pe = ${getPercentile('communitiesMember', generatedCommunities.communitiesMember)}`,
            dataPoints: generatedCommunities.communitiesMember.map(({ RSD, count }) => ({ x: RSD, y: count })),
            realRSD: realCommunitiesAveragedDeviations.communitiesMember,
        },
        {
            canvas: topGamesGiniCoefficientRSDDistributionCanvas,
            label: `f) Gini koeficient rozloženia herného času pf = ${getPercentile('topGamesGiniCoefficient', generatedCommunities.topGamesGiniCoefficient)}`,
            dataPoints: generatedCommunities.topGamesGiniCoefficient.map(({ RSD, count }) => ({ x: RSD, y: count })),
            realRSD: realCommunitiesAveragedDeviations.topGamesGiniCoefficient,
        },
    ];

    chartOptionsObjects.forEach(options => new Chart(options.canvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [20, 5],
                    pointRadius: 0,
                    borderWidth: 6,
                    label: `${options.label} - real communities`,
                    backgroundColor: 'rgba(255, 0, 55, 0.8)',
                    borderColor: 'rgba(255, 0, 55, 0.8)',
                    data: [{ x: options.realRSD, y: 0 }, { x: options.realRSD, y: getMaxY(options.dataPoints, this) }],
                },
                {
                    showLine: true,
                    pointRadius: 0,
                    fill: true,
                    label: options.label,
                    backgroundColor: 'rgba(133, 73, 186, 0.8)',
                    data: options.dataPoints,
                },
            ],
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: options.label,
                        fontSize: 26,
                    },
                    ticks: {
                        fontSize: 18,
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    ticks: {
                        fontSize: 18 
                    }
                }]
            },
            legend: {
                display: false,
            },
        }
    }))
})