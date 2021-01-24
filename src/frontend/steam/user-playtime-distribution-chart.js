const userPlaytimeDistributionCanvas = document.getElementById('userPlaytimeDistribution');

axios.get(`${apiUrl}/user-playtime-distribution`).then((response) => {
    const {
        userPlaytimeDistribution,
    } = response.data;

    const dataPoints = userPlaytimeDistribution.map(({ playtime, p }) => ({ x: playtime, y: p }));

    const minX = dataPoints.reduce((min, { x }) => Math.min(min, x), Infinity);
    const maxX = dataPoints.reduce((max, { x }) => Math.max(max, x), -Infinity);
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

    new Chart(userPlaytimeDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: false,
                    label: 'User playtime distribution',
                    backgroundColor: 'rgba(133, 73, 186, 0.7)',
                    borderColor: 'rgba(133, 73, 186, 0.7)',
                    data: dataPoints,
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: 'User playtime distribution'
            },
            scales: {
                xAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'playtime',
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