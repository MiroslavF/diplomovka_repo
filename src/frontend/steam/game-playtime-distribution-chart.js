const gamePlaytimeDistributionCanvas = document.getElementById('gamePlaytimeDistribution');

axios.get(`${apiUrl}/game-playtime-distribution`).then((response) => {
    const {
        gamePlaytimeDistribution,
        avgPlaytimeFraction,
    } = response.data;

    const dataPoints = gamePlaytimeDistribution.map(({ playtimeFraction, p }) => ({ x: playtimeFraction, y: p }));

    const minX = dataPoints.reduce((min, { x }) => Math.min(min, x), 1);
    const minY = dataPoints.reduce((min, { y }) => Math.min(min, y), 1);

    function buildXAxisTicks(minX) {
        ticks = [1];
        let last = 1;
        while (last > minX) {
            last = last / 10;
            ticks.push(last);
        }
        return ticks;
    }
    
    function buildYAxisTicks(minY) {
        ticks = [0.1];
        let last = 0.1;
        while (last > minY) {
            last = last / 10;
            ticks.push(last);
        }
        return ticks;
    }

    const xAxisTicks = buildXAxisTicks(minX);
    const yAxisTicks = buildYAxisTicks(minY);

    new Chart(gamePlaytimeDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: false,
                    label: 'Game playtime distribution',
                    backgroundColor: 'rgba(133, 73, 186, 0.3)',
                    borderColor: 'rgba(133, 73, 186, 0.3)',
                    data: dataPoints,
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [20, 10],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `average playtime per game = ${avgPlaytimeFraction}`,
                    backgroundColor: 'rgba(0, 153, 51, 0.7)',
                    borderColor: 'rgba(0, 153, 51, 0.7)',
                    data: [{ x: avgPlaytimeFraction, y: Math.min(...yAxisTicks) }, { x: avgPlaytimeFraction, y: Math.max(...yAxisTicks)  }],
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
                        labelString: 'playtime fraction',
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0,
                        max: Math.max(...xAxisTicks),
                        callback: (value, index) => value.toFixed(index),
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