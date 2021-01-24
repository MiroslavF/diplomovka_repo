const degreeExponentNormalCanvas = document.getElementById('degreeExponentNormal');
const degreeExponentNormalLogBinnedCanvas = document.getElementById('degreeExponentNormalLogBinned');
const degreeExponentCumulativeCanvas = document.getElementById('degreeExponentCumulative');
const degreeExponentCumulativeLogBinnedCanvas = document.getElementById('degreeExponentCumulativeLogBinned');

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

function getMinX(dataPoints) {
    return Math.min(...dataPoints.map(({ x }) => x));
}

axios.get(`${apiUrl}/degree-exponents`).then((response) => {
    const {
        degreeExponents,
        normal,
        normalLogBinned,
        cumulative,
        cumulativeLogBinned,
        regressionType,
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

    xAxisTicks = buildXAxisTicks(maxDegree);
    yAxisTicks = buildYAxisTicks(minProbability);
    lastXTick = xAxisTicks[xAxisTicks.length - 1];

    const chartsOptions = [
        {
            canvas: degreeExponentNormalCanvas,
            dataPoints: normal.map(({ k, pk }) => ({ x: k, y: pk })),
            label: 'Normal',
            c: degreeExponents.regressions.normal.c,
            exp: degreeExponents.regressions.normal.exp,
            r2: degreeExponents.regressions.normal.r2,
            cCut: degreeExponents.regressionsWithCutoffs.normal.c,
            expCut: degreeExponents.regressionsWithCutoffs.normal.exp,
            r2Cut: degreeExponents.regressionsWithCutoffs.normal.r2,
            kMin: degreeExponents.regressionsWithCutoffs.normal.kMin,
            kMax: degreeExponents.regressionsWithCutoffs.normal.kMax,
            cumulative: false,
            logBinned: false,
            minK: Math.min(...normal.map(({ k }) => k)),
        },
        {
            canvas: degreeExponentNormalLogBinnedCanvas,
            dataPoints: normalLogBinned.map(({ k, pk }) => ({ x: k, y: pk })),
            label: 'Normal log binned',
            c: degreeExponents.regressions.normalLogBinned.c,
            exp: degreeExponents.regressions.normalLogBinned.exp,
            r2: degreeExponents.regressions.normalLogBinned.r2,
            cCut: degreeExponents.regressionsWithCutoffs.normalLogBinned.c,
            expCut: degreeExponents.regressionsWithCutoffs.normalLogBinned.exp,
            r2Cut: degreeExponents.regressionsWithCutoffs.normalLogBinned.r2,
            kMin: degreeExponents.regressionsWithCutoffs.normalLogBinned.kMin,
            kMax: degreeExponents.regressionsWithCutoffs.normalLogBinned.kMax,
            cumulative: false,
            logBinned: true,
            minK: Math.min(...normalLogBinned.map(({ k }) => k)),
        },
        {
            canvas: degreeExponentCumulativeCanvas,
            dataPoints: cumulative.map(({ k, pk }) => ({ x: k, y: pk })),
            label: 'Cumulative',
            c: degreeExponents.regressions.cumulative.c,
            exp: degreeExponents.regressions.cumulative.exp,
            r2: degreeExponents.regressions.cumulative.r2,
            cCut: degreeExponents.regressionsWithCutoffs.cumulative.c,
            expCut: degreeExponents.regressionsWithCutoffs.cumulative.exp,
            r2Cut: degreeExponents.regressionsWithCutoffs.cumulative.r2,
            kMin: degreeExponents.regressionsWithCutoffs.cumulative.kMin,
            kMax: degreeExponents.regressionsWithCutoffs.cumulative.kMax,
            cumulative: true,
            logBinned: false,
            minK: Math.min(...cumulative.map(({ k }) => k)),
        },
        {
            canvas: degreeExponentCumulativeLogBinnedCanvas,
            dataPoints: cumulativeLogBinned.map(({ k, pk }) => ({ x: k, y: pk })),
            label: 'Cumulative log binned',
            c: degreeExponents.regressions.cumulativeLogBinned.c,
            exp: degreeExponents.regressions.cumulativeLogBinned.exp,
            r2: degreeExponents.regressions.cumulativeLogBinned.r2,
            cCut: degreeExponents.regressionsWithCutoffs.cumulativeLogBinned.c,
            expCut: degreeExponents.regressionsWithCutoffs.cumulativeLogBinned.exp,
            r2Cut: degreeExponents.regressionsWithCutoffs.cumulativeLogBinned.r2,
            kMin: degreeExponents.regressionsWithCutoffs.cumulativeLogBinned.kMin,
            kMax: degreeExponents.regressionsWithCutoffs.cumulativeLogBinned.kMax,
            cumulative: true,
            logBinned: true,
            minK: Math.min(...cumulativeLogBinned.map(({ k }) => k)),
        },
    ];

    chartsOptions.forEach(options => new Chart(options.canvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    showLine: true,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 3,
                    label: `\u03B3 = ${options.cumulative ? -(options.exp - 1) : -options.exp} (r\u00B2 = ${options.r2})`,
                    backgroundColor: 'rgb(255, 51, 95)',
                    borderColor: 'rgb(255, 51, 95)',
                    data: regressionType === 'LINEAR' ?
                        [
                            { x: options.minK, y: Math.E**(options.c + Math.log(options.minK) * options.exp) },
                            { x: lastXTick, y: Math.E**(options.c + Math.log(lastXTick) * options.exp) },
                        ] : [
                            { x: options.minK, y: options.c * (options.minK ** options.exp) },
                            { x: lastXTick, y: options.c * (lastXTick ** options.exp) },
                        ],
                },
                {
                    showLine: true,
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 3,
                    label: `\u03B3 (with cutoffs) = ${options.cumulative ? -(options.expCut - 1) : -options.expCut} (r\u00B2 = ${options.r2Cut})`,
                    backgroundColor: 'rgb(0, 153, 51)',
                    borderColor: 'rgb(0, 153, 51)',
                    data: regressionType === 'LINEAR' ?
                        [
                            { x: options.minK, y: Math.E**(options.cCut + Math.log(options.minK) * options.expCut) },
                            { x: lastXTick, y: Math.E**(options.cCut + Math.log(lastXTick) * options.expCut) },
                        ] : [
                            { x: options.minK, y: options.cCut * (options.minK ** options.expCut) },
                            { x: lastXTick, y: options.cCut * (lastXTick ** options.expCut) },
                        ],
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [5],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `kMin = ${options.kMin}`,
                    backgroundColor: 'rgb(0, 153, 51)',
                    borderColor: 'rgb(0, 153, 51)',
                    data: [{ x: options.kMin, y: 0 }, { x: options.kMin, y: 1, }],
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [5],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `kMax = ${options.kMax}`,
                    backgroundColor: 'rgb(0, 153, 51)',
                    borderColor: 'rgb(0, 153, 51)',
                    data: [{ x: options.kMax, y: 0 }, { x: options.kMax, y: 1, }],
                },
                {
                    showLine: false,
                    label: options.label,
                    pointRadius: options.logBinned ? 6 : 3,
                    backgroundColor: 'rgba(133, 73, 186, 0.6)',
                    borderColor: 'rgba(133, 73, 186, 0.6)',
                    data: options.dataPoints,
                },
            ]
        },
        options: {
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
    }));
});
