const mostPlayedGamesCanvas = document.getElementById('mostPlayedGames');

function getRandomColorString() {
    const randint = max => Math.floor(Math.random() * max);
    return `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`
}

axios.get(`${apiUrl}/most-played-games`).then((response) => {
    let { games, displayLimit, showRest } = response.data;

    let toDisplay = games.slice(0, displayLimit);
    const rest = games.slice(displayLimit);
    const restSum = rest.reduce((sum, curr) => sum + curr.totalPlaytime, 0);

    if (showRest) {
        displayLimit += 1;
        toDisplay = toDisplay.concat([{ totalPlaytime: restSum, name: "Ostatné" }]);
    }
    
    new Chart(mostPlayedGamesCanvas, {
        type: 'pie',
        data: {
            datasets: [{
                data: toDisplay.map(game => Math.round(game.totalPlaytime)),
                backgroundColor: new Array(displayLimit).fill().map(_ => getRandomColorString()),
                borderWidth: 0.5,
            }],
            labels: toDisplay.map(game => game.name),
        }
    });
});