const communityFavouriteGamesMatchCanvas = document.getElementById('communityFavouriteGamesMatch');

axios.get(`${apiUrl}/community-favourite-games-match`).then((response) => {
    const {
        communityFavouriteGamesMatch,
    } = response.data;

    const dataPoints = communityFavouriteGamesMatch
        .map(({ matchingCommunityFraction }) => matchingCommunityFraction);

    const labels = communityFavouriteGamesMatch
        .map(({ topNGames }) => topNGames);

    new Chart(communityFavouriteGamesMatchCanvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Počet najoblubenejších hier',
                    backgroundColor: 'rgba(255, 0, 55, 0.8)',
                    borderColor: 'rgba(255, 0, 55, 0.8)',
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
                text: 'Community favourite games match'
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
                        labelString: 'pc',
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