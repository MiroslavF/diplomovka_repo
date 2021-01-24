const degreeDistributionCanvas = document.getElementById('degreeDistribution');

function buildXAxisTicks(maxX) {
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

function buildYAxisTicks(minY) {
    ticks = [1];
    let last = 1;
    while (last >= minY) {
        ticks.push(last / 10);
        last = ticks[ticks.length - 1];
    }
    return ticks;
}

axios.get(`${apiUrl}/degree-distribution`).then((response) => {
    const {
        normal,
        normalLogBinned,
        logBinScaleFactor,
        cumulative,
        cumulativeLogBinned,
        averageNodeDegree,
    } = response.data;

    const maxDegree = Math.max(
        normal.reduce((maxK, { k }) => Math.max(maxK, k), 0),
        normalLogBinned.reduce((maxK, { k }) => Math.max(maxK, k), 0),
        cumulative.reduce((maxK, { k }) => Math.max(maxK, k), 0),
        cumulativeLogBinned.reduce((maxK, { k }) => Math.max(maxK, k), 0),
    );

    const minProbability = Math.min(
        normal.reduce((minPk, { pk }) => Math.min(minPk, pk), 1),
        normalLogBinned.reduce((minPk, { pk }) => Math.min(minPk, pk), 1),
        cumulative.reduce((minPk, { pk }) => Math.min(minPk, pk), 1),
        cumulativeLogBinned.reduce((minPk, { pk }) => Math.min(minPk, pk), 1),
    );

    const normalDataPoints = normal.map(({ k, pk }) => ({ x: k, y: pk }));
    const normalLogBinnedDataPoints = normalLogBinned.map(({ k, pk }) => ({ x: k, y: pk }));
    const cumulativeDataPoints = cumulative.map(({ k, pk }) => ({ x: k, y: pk }));
    const cumulativeLogBinnedDataPoints = cumulativeLogBinned.map(({ k, pk }) => ({ x: k, y: pk }));

    const xAxisTicks = buildXAxisTicks(maxDegree);
    const yAxisTicks = buildYAxisTicks(minProbability);

    new Chart(degreeDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: false,
                    label: `Normal log binned (c = ${logBinScaleFactor})`,
                    backgroundColor: 'rgb(133, 73, 186)',
                    borderColor: 'rgb(0, 0, 0)',
                    pointRadius: 6,
                    pointHoverRadius: 7,
                    data: normalLogBinnedDataPoints,
                },
                {
                    showLine: false,
                    label: 'Normal',
                    backgroundColor: 'rgba(133, 73, 186, 0.2)',
                    borderColor: 'rgba(133, 73, 186, 0.2)',
                    data: normalDataPoints,
                },
                {
                    showLine: false,
                    label: `Cumulative log binned (c = ${logBinScaleFactor})`,
                    backgroundColor: 'rgb(255, 0, 55)',
                    borderColor: 'rgb(0, 0, 0)',
                    pointRadius: 6,
                    pointHoverRadius: 7,
                    data: cumulativeLogBinnedDataPoints,
                },
                {
                    showLine: false,
                    label: 'Cumulative',
                    backgroundColor: 'rgba(255, 51, 95, 0.3)',
                    borderColor: 'rgba(255, 51, 95, 0.3)',
                    pointRadius: 2,
                    pointHoverRadius: 3,
                    data: cumulativeDataPoints,
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [20, 10],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `⟨k⟩ = ${averageNodeDegree}`,
                    backgroundColor: 'rgba(0, 153, 51, 0.7)',
                    borderColor: 'rgba(0, 153, 51, 0.7)',
                    data: [{ x: averageNodeDegree, y: yAxisTicks[yAxisTicks.length-1] }, { x: averageNodeDegree, y: 1 }],
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Distribúcia stupňa uzlov'
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
                        labelString: 'p(k)',
                        fontSize: 18,
                    },
                    ticks: {
                        min: yAxisTicks[yAxisTicks.length - 1],
                        max: 1,
                        callback: (value, index) => Number(value).toFixed(index),
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