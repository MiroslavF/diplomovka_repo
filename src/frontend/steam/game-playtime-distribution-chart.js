const gamePlaytimeDistributionCanvas = document.getElementById('gamePlaytimeDistribution');

axios.get(`${apiUrl}/game-playtime-distribution`).then((response) => {
    const {
        gamePlaytimeDistribution,
        avgGamePlaytime,
    } = response.data;

    const dataPoints = gamePlaytimeDistribution.map(({ playtime, p }) => ({ x: playtime, y: p }));

    const minY = dataPoints.reduce((min, { y }) => Math.min(min, y), 1);
 
    function buildYAxisTicks(minY) {
        ticks = [0.1];
        let last = 0.1;
        while (last > minY) {
            last = last / 10;
            ticks.push(last);
        }
        return ticks;
    }

    // const xAxisTicks = buildXAxisTicks(minX);
    const xAxisTicks = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
    const yAxisTicks = buildYAxisTicks(minY);

    new Chart(gamePlaytimeDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: false,
                    label: 'Game playtime distribution',
                    backgroundColor: 'rgba(133, 73, 186, 0.35)',
                    borderColor: 'rgba(133, 73, 186, 0.35)',
                    data: dataPoints,
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [20, 10],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `average playtime per game = ${avgGamePlaytime}`,
                    backgroundColor: 'rgba(0, 153, 51, 0.7)',
                    borderColor: 'rgba(0, 153, 51, 0.7)',
                    data: [{ x: avgGamePlaytime, y: Math.min(...yAxisTicks) }, { x: avgGamePlaytime, y: Math.max(...yAxisTicks)  }],
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Game playtime distribution'
            },
            scales: {
                xAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'h',
                        fontSize: 22,
                    },
                    ticks: {
                        min: 1,
                        max: 100000000,
                        callback: (value) => value.toLocaleString(),
                    },
                    afterBuildTicks: chart => chart.ticks = xAxisTicks,
                }],
                yAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'p',
                        fontSize: 22,
                    },
                    ticks: {
                        min: Math.min(...yAxisTicks),
                        max: Math.max(...yAxisTicks),
                        callback: (value, index) => value.toFixed(index + 1),
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