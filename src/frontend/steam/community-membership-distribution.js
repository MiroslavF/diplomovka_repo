const communityMembershipDistributionCanvas = document.getElementById('communityMembershipDistribution');

axios.get(`${apiUrl}/community-membership-distribution`).then((response) => {
    const {
        communityMembershipDistribution,
        avgCommunitiesMember,
    } = response.data;

    const dataPoints = communityMembershipDistribution.map(({ communitiesMember, p }) => ({ x: communitiesMember, y: p }));

    const maxX = dataPoints.reduce((max, { x }) => Math.max(max, x), 0);
    const minY = dataPoints.reduce((min, { y }) => Math.min(min, y), 1);

    function buildXAxisTicks(maxX) {
        ticks = [0, 1];
        let last = 1;
        while (last < maxX) {
            if (ticks.length % 2 === 0) {
                last = last * 3;
            } else {
                last = ticks[ticks.length - 2] * 10;
            }
            ticks.push(last);
        }
        return ticks;
    }
    
    function buildYAxisTicks(minY) {
        ticks = [1];
        let last = 1;
        while (last >= minY) {
            last = last / 10;
            ticks.push(last);
        }
        return ticks;
    }

    const xAxisTicks = buildXAxisTicks(maxX);
    const yAxisTicks = buildYAxisTicks(minY);

    new Chart(communityMembershipDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: false,
                    label: 'Game playtime distribution',
                    backgroundColor: 'rgba(133, 73, 186, 0.8)',
                    borderColor: 'rgba(133, 73, 186, 0.8)',
                    data: dataPoints,
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [20, 10],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `average community member = ${avgCommunitiesMember}`,
                    backgroundColor: 'rgba(0, 153, 51, 0.7)',
                    borderColor: 'rgba(0, 153, 51, 0.7)',
                    data: [{ x: avgCommunitiesMember, y: Math.min(...yAxisTicks) }, { x: avgCommunitiesMember, y: Math.max(...yAxisTicks)  }],
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Community membership distribution'
            },
            scales: {
                xAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'communities',
                        fontSize: 18,
                    },
                    ticks: {
                        min: Math.min(...xAxisTicks),
                        max: Math.max(...xAxisTicks),
                        callback: (value) => Number(value).toString(),
                    },
                    afterBuildTicks: chart => chart.ticks = xAxisTicks,
                }],
                yAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'p',
                        fontSize: 18,
                    },
                    ticks: {
                        min: Math.min(...yAxisTicks),
                        max: Math.max(...yAxisTicks),
                        callback: (value, index) => value.toFixed(index),
                    },
                    afterBuildTicks: chart => chart.ticks = yAxisTicks,
                }]
            },
            legend: {
                labels: {
                    fontSize: 14,
                },
            },
        }
    });
});