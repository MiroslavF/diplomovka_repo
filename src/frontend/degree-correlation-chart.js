const degreeCorrelationsCanvas = document.getElementById('degreeCorrelations');

function buildTicks(maxX) {
    ticks = [0, 3];
    let last = 3;
    while (last < maxX) {
        if (last % 10 === 0) {
            ticks.push(Math.floor(last * 10 / 3));
        } else {
            ticks.push(last * 3 + 1);
        }
        last = ticks[ticks.length - 1];
    }
    return ticks;
}

axios.get(`${apiUrl}/degree-correlations`).then((response) => {
    const { degreeCorrelations, randomizedDegreeCorrelations } = response.data;

    const degreeCorrelationsDataPoints = degreeCorrelations.map(({ k, knn }) => ({ x: k, y: knn }));
    const randomizedDegreeCorrelationsDataPoints = randomizedDegreeCorrelations.map(({ k, knn }) => ({ x: k, y: knn }));


    const maxX = [
        ...degreeCorrelationsDataPoints,
        ...randomizedDegreeCorrelationsDataPoints
    ]
        .reduce((max, { x }) => Math.max(max, x), 0);

    const maxY = [
        ...degreeCorrelationsDataPoints,
        ...randomizedDegreeCorrelationsDataPoints,
    ]
        .reduce((max, { y }) => Math.max(max, y), 0);

    const xAxisTicks = buildTicks(maxX);
    const yAxisTicks = buildTicks(maxY);

    new Chart(degreeCorrelationsCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    fill: false,
                    showLine: false,
                    label: 'After degree preserving randomization',
                    backgroundColor: 'rgba(191, 15, 86, 0.9)',
                    borderColor: 'rgba(191, 15, 86, 0.9)',
                    pointRadius: 3,
                    pointHoverRadius: 4,
                    data: randomizedDegreeCorrelationsDataPoints,
                },
                {
                    fill: false,
                    showLine: false,
                    label: 'Degree correlationns',
                    backgroundColor: 'rgba(133, 73, 186, 0.7)',
                    borderColor: 'rgba(133, 73, 186, 0.7)',
                    pointRadius: 3,
                    pointHoverRadius: 4,
                    data: degreeCorrelationsDataPoints,
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Degree correlationns'
            },
            scales: {
                xAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'k',
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0,
                        max: xAxisTicks[xAxisTicks.length - 1],
                        callback: value => Number(value).toString(),
                    },
                    afterBuildTicks: chart => chart.ticks = xAxisTicks,
                }],
                yAxes: [{
                    type: 'logarithmic',
                    scaleLabel: {
                        display: true,
                        labelString: 'knn(k)',
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0,
                        max: yAxisTicks[yAxisTicks.length - 1],
                        callback: (value, index) => Number(value),
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