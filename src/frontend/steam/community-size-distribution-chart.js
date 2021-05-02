const communitySizeDistributionCanvas = document.getElementById('communitySizeDistribution');

axios.get(`${apiUrl}/community-size-distribution`).then((response) => {
    const {
        communitySizeDistribution,
        avgCommunitySize,
        regression,
    } = response.data;

    const dataPoints = communitySizeDistribution.map(({ size, p }) => ({ x: size, y: p }));

    const maxX = dataPoints.reduce((max, { x }) => Math.max(max, x), 0);
    const minY = dataPoints.reduce((min, { y }) => Math.min(min, y), 1);

    function buildXAxisTicks(maxX) {
        ticks = [1];
        let last = 1;
        while (last < maxX) {
            last = last * 10;
            ticks.push(last);
        }
        return ticks;
    }
    
    function buildYAxisTicks(minY) {
        ticks = [1];
        let last = 1;
        while (last > minY) {
            last = last / 10;
            ticks.push(last);
        }
        return ticks;
    }

    const xAxisTicks = buildXAxisTicks(maxX);
    const yAxisTicks = buildYAxisTicks(minY);

    new Chart(communitySizeDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: true,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 3,
                    label: regression.exp,
                    backgroundColor: 'rgb(255, 51, 95)',
                    borderColor: 'rgb(255, 51, 95)',
                    data: [
                        { x: 1, y: Math.E**(regression.c + Math.log(1) * regression.exp) },
                        { x: 100000, y: Math.E**(regression.c + Math.log(100000) * regression.exp) },
                    ],
                },
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
                    label: `average community size = ${avgCommunitySize}`,
                    backgroundColor: 'rgba(0, 153, 51, 0.7)',
                    borderColor: 'rgba(0, 153, 51, 0.7)',
                    data: [{ x: avgCommunitySize, y: Math.min(...yAxisTicks) }, { x: avgCommunitySize, y: Math.max(...yAxisTicks)  }],
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Community size distribution'
            },
            scales: {
                xAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 's <s>',
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