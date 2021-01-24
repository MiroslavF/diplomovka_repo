const communityFavouriteGamesMatchCanvas = document.getElementById('communityFavouriteGamesMatch');

axios.get(`${apiUrl}/community-favourite-games-match`).then((response) => {
    const {
        communityFavouriteGamesMatch,
    } = response.data;

    let dataPoints = communityFavouriteGamesMatch
        .map(({ matchingCommunityFraction }) => matchingCommunityFraction);

    let labels = communityFavouriteGamesMatch
    .map(({ topNGames }) => topNGames);

    labels = ['', ...labels];
    dataPoints = [0, ...dataPoints];

    new Chart(communityFavouriteGamesMatchCanvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Počet najoblubenejších hier',
                    backgroundColor: 'rgba(133, 73, 186, 0.8)',
                    borderColor: 'rgba(133, 73, 186, 0.8)',
                    borderWidth: 1,
                    data: dataPoints,
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