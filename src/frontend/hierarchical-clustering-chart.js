const hierarchicalClusteringCanvas = document.getElementById('hierarchicalClustering');

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

axios.get(`${apiUrl}/hierarchical-clustering`).then((response) => {
    const {
        hierarchicalClustering,
        logBinnedHierarchicalClustering,
        hierarchicalClusteringRegression,
        regressionType,
    } = response.data;

    const dataPoints = hierarchicalClustering.map(({ k, ck }) => ({ x: k, y: ck }));
    const logBinnedDataPoints = logBinnedHierarchicalClustering.map(({ k, ck }) => ({ x: k, y: ck }));

    const maxX = Math.max(
        ...dataPoints.map(({ x }) => x),
        ...logBinnedDataPoints.map(({ x }) => x)
        );
    const nonZeroMinY = [
        ...dataPoints,
        // ...logBinnedDataPoints
    ]
        .reduce((min, { y }) => (y < min && y > 0 ? y : min), 1);

    const xAxisTicks = buildXAxisTicks(maxX);
    const yAxisTicks = [...buildYAxisTicks(nonZeroMinY), 0];
    const lastXTick = xAxisTicks[xAxisTicks.length - 1];

    const { normal, logBinned } = hierarchicalClusteringRegression;
    normal.minK = Math.min(...hierarchicalClustering.map(({ k }) => k));
    logBinned.minK = Math.min(...logBinnedHierarchicalClustering.map(({ k }) => k));

    new Chart(hierarchicalClusteringCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: true,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 3,
                    label: `\u03B4 = ${-logBinned.exp} (r\u00B2 = ${logBinned.r2})`,
                    backgroundColor: 'rgb(255, 0, 55)',
                    borderColor: 'rgb(255, 0, 55)',
                    data: regressionType === 'LINEAR' ?
                        [
                            { x: logBinned.minK, y: Math.E**(logBinned.c + Math.log(logBinned.minK) * logBinned.exp) },
                            { x: lastXTick, y: Math.E**(logBinned.c + Math.log(lastXTick) * logBinned.exp) },
                        ] : [
                            { x: logBinned.minK, y: logBinned.c * (logBinned.minK ** logBinned.exp) },
                            { x: lastXTick, y: logBinned.c * (lastXTick ** logBinned.exp) },
                        ],
                },
                {
                    showLine: true,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 3,
                    label: `\u03B4 = ${-normal.exp} (r\u00B2 = ${normal.r2})`,
                    backgroundColor: 'rgba(133, 73, 186, 0.9)',
                    borderColor: 'rgba(133, 73, 186, 0.9)',
                    data: regressionType === 'LINEAR' ?
                        [
                            { x: normal.minK, y: Math.E**(normal.c + Math.log(normal.minK) * normal.exp) },
                            { x: lastXTick, y: Math.E**(normal.c + Math.log(lastXTick) * normal.exp) },
                        ] : [
                            { x: normal.minK, y: normal.c * (normal.minK ** normal.exp) },
                            { x: lastXTick, y: normal.c * (lastXTick ** normal.exp) },
                        ],
                },
                {
                    showLine: false,
                    label: `Log binned`,
                    backgroundColor: 'rgb(255, 0, 55)',
                    borderColor: 'rgb(0, 0, 0)',
                    pointRadius: 6,
                    pointHoverRadius: 7,
                    data: logBinnedDataPoints,
                },
                {
                    fill: false,
                    label: 'Normal',
                    showLine: false,
                    backgroundColor: 'rgba(133, 73, 186, 0.9)',
                    borderColor: 'rgba(133, 73, 186, 0.9)',
                    pointRadius: 3,
                    pointHoverRadius: 4,
                    data: dataPoints,
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [5],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `kMin = ${normal.kMin}`,
                    backgroundColor: 'rgba(133, 73, 186, 0.8)',
                    borderColor: 'rgba(133, 73, 186, 0.8)',
                    data: [{ x: normal.kMin, y: 0 }, { x: normal.kMin, y: 1, }],
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [5],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `kMax = ${normal.kMax}`,
                    backgroundColor: 'rgba(133, 73, 186, 0.8)',
                    borderColor: 'rgba(133, 73, 186, 0.8)',
                    data: [{ x: normal.kMax, y: 0 }, { x: normal.kMax, y: 1, }],
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [5],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `kMin = ${logBinned.kMin}`,
                    backgroundColor: 'rgb(255, 0, 55)',
                    borderColor: 'rgb(255, 0, 55)',
                    data: [{ x: logBinned.kMin, y: 0 }, { x: logBinned.kMin, y: 1, }],
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [5],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `kMax = ${logBinned.kMax}`,
                    backgroundColor: 'rgb(255, 0, 55)',
                    borderColor: 'rgb(255, 0, 55)',
                    data: [{ x: logBinned.kMax, y: 0 }, { x: logBinned.kMax, y: 1, }],
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Hierarchické klastrovanie'
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
                        labelString: 'c(k)',
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