const clusteringCoefficientDistributionCanvas = document.getElementById('clusteringCoefficientDistribution');

axios.get(`${apiUrl}/clustering-coefficient-distribution`).then((response) => {
    const {
        clusteringCoefficientDistribution,
        averageClusteringCoefficient,
    } = response.data;

    const distributionDataPoints = clusteringCoefficientDistribution.map(({ c, pc }) => ({ x: c, y: pc }));
    const maxY = distributionDataPoints.reduce((max, { y }) => Math.max(max, y), 0);

    new Chart(clusteringCoefficientDistributionCanvas, {
        type: 'line',
        data: {
            datasets: [
                {
                    fill: false,
                    label: 'Distribúcia lokálneho klasterifikačného koeficientu',
                    showLine: false,
                    backgroundColor: 'rgba(133, 73, 186, 0.9)',
                    borderColor: 'rgba(133, 73, 186, 0.9)',
                    pointRadius: 5,
                    pointHoverRadius: 5,
                    data: distributionDataPoints,
                },
                {
                    showLine: true,
                    steppedLine: true,
                    borderDash: [20, 10],
                    pointRadius: 0,
                    borderWidth: 2,
                    label: `Priemerný klasterifikačný koeficient ⟨c⟩ = ${averageClusteringCoefficient}`,
                    backgroundColor: 'rgba(255, 51, 95, 0.7)',
                    borderColor: 'rgba(255, 51, 95, 0.7)',
                    data: [
                        { x: averageClusteringCoefficient, y: 0 },
                        { x: averageClusteringCoefficient, y: 0.05 * Math.ceil(maxY / 0.05) },
                    ],
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Distribúcia lokálneho klasterizačného koeficientu'
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'c',
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0,
                        max: 1,
                    },
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: 'p(c)',
                        fontSize: 18,
                    },
                    ticks: {
                        min: 0,
                        max: 0.05 * Math.ceil(maxY / 0.05),
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