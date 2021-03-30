const usersGamesMatchCanvas = document.getElementById('usersGamesMatch');

axios.get(`${apiUrl}/users-games-match`).then((response) => {
    const {
        usersGamesMatch,
    } = response.data;

    const dataPoints = usersGamesMatch
        .map(({ matchingGameFraction }) => matchingGameFraction);

    const labels = usersGamesMatch
        .map(({ topGamesCount }) => topGamesCount);

    new Chart(usersGamesMatchCanvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Todo lepsie meno',
                    backgroundColor: 'rgba(133, 73, 186, 0.8)',
                    borderColor: 'rgba(133, 73, 186, 0.8)',
                    borderWidth: 1,
                    data: dataPoints,
                    fill: false,
                    lineTension: 0,
                    pointRadius: 6,
                    borderWidth: 1,
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: 'Users games match'
            },
            scales: {
                yAxes: [{
                    type: 'linear',
                    ticks: {
                        min: 0,
                        max: 1,
                        stepSize: 0.1,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'pe',
                        fontSize: 22,
                    },
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'g',
                        fontSize: 22,
                    },
                }],
            },
            legend: {
                labels: {
                    fontSize: 14,
                },
            },
        }
    });
});