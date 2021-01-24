const networkEvolutionCanvas = document.getElementById('networkEvolution');

axios.get(`${apiUrl}/network-evolution`).then((response) => {
    const {
        networkEvolution,
        showUserCount,
        showEdgeCount,
    } = response.data;
    const { edgesDates, usersDates } = networkEvolution;

    const edgeCountDataPoints = edgesDates.map(({ since, count }) => ({ x: since, y: count }));
    const userCountDataPoints = usersDates.map(({ since, count }) => ({ x: since, y: count }));
    
    function buildXAxisTicks(minTimestamp, maxTimestamp) {
        const YEAR_MILISECONDS = 31556952000;
        const minYear = new Date(minTimestamp).getFullYear();
        let last = new Date(`${minYear}-01-01T00:00:00.000Z`).getTime();
        ticks = [last];
        while (last <= maxTimestamp) {
            last += YEAR_MILISECONDS;
            ticks.push(last);
        }
        ticks.push(last);
        return ticks;
    }

    const minTimestamp = Math.min(
        (showEdgeCount ? edgeCountDataPoints.reduce((min, curr) => Math.min(min, curr.x), Infinity) : Date.now()),
        (showUserCount ? userCountDataPoints.reduce((min, curr) => Math.min(min, curr.x), Infinity) : Date.now()),
    );

    const maxTimestamp = Math.max(
        (showEdgeCount ? edgeCountDataPoints.reduce((max, curr) => Math.max(max, curr.x), -Infinity) : 0),
        (showUserCount ? userCountDataPoints.reduce((max, curr) => Math.max(max, curr.x), -Infinity) : 0),
    );

    const xAxisTicks = buildXAxisTicks(minTimestamp, maxTimestamp);

    const datasets = [];
    if (showUserCount) {
        datasets.push({
            showLine: true,
            fill: false,
            pointRadius: 0,
            label: 'Počet hráčov',
            backgroundColor: 'rgba(133, 73, 186, 0.9)',
            borderColor: 'rgba(133, 73, 186, 0.9)',
            data: userCountDataPoints,
        });
    }
    if (showEdgeCount) {
        datasets.push({
            showLine: true,
            fill: false,
            pointRadius: 0,
            label: 'Počet hrán',
            backgroundColor: 'rgba(255, 51, 95, 0.9)',
            borderColor: 'rgba(255, 51, 95, 0.9)',
            data: edgeCountDataPoints,
        });
    }

    new Chart(networkEvolutionCanvas, {
        type: 'line',
        data: {
            datasets,
        },
        options: {
            title: {
                display: true,
                text: 'Network evolution'
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'time',
                        fontSize: 18,
                    },
                    ticks: {
                        min: Math.min(...xAxisTicks),
                        max: Math.max(...xAxisTicks),
                        callback: value => new Date(value).getFullYear(),
                    },
                    afterBuildTicks: chart => chart.ticks = xAxisTicks,
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'values',
                        fontSize: 18,
                    },
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