const distanceDistributionCanvas = document.getElementById('distanceDistribution');

axios.get(`${apiUrl}/distance-distribution`).then((response) => {
    const { distanceDistribution, averageDistance } = response.data;

    const distanceDistributionDataPoints = distanceDistribution.map(({ d, pd }) => ({ x: d, y: pd }));
    const maxX = distanceDistributionDataPoints.reduce((max, { x }) => Math.max(max, x), 0);
    const maxY = distanceDistributionDataPoints.reduce((max, { y }) => Math.max(max, y), 0);

    new Chart(distanceDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    fill: false,
                    label: 'Distribúcia vzdialeností',
                    lineTension: 0,
                    backgroundColor: 'rgba(133, 73, 186, 0.9)',
                    borderColor: 'rgba(133, 73, 186, 0.9)',
                    pointRadius: 5,
                    pointHoverRadius: 6,
                    data: distanceDistributionDataPoints,
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [20, 10],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `Priemerná vzdialenosť ⟨d⟩ = ${averageDistance}`,
                    backgroundColor: 'rgba(255, 51, 95, 0.7)',
                    borderColor: 'rgba(255, 51, 95, 0.7)',
                    data: [{ x: averageDistance, y: 0 }, { x: averageDistance, y: Math.ceil(maxY * 10) / 10, }],
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Distribúcia vzdialeností'
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'd',
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0,
                        max: maxX + 1,
                    },
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'p(d)',
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0,
                        max: Math.ceil(maxY * 10) / 10,
                        stepSize: 0.05,
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