const countryDistributionCanvas = document.getElementById('countryDistribution');

function getRandomColorString() {
    const randint = max => Math.floor(Math.random() * max);
    return `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`
}

axios.get(`${apiUrl}/country-distribution`).then((response) => {
    let { countryDistribution, displayLimit, showRest } = response.data;

    let toDisplay = countryDistribution.slice(0, displayLimit);
    const rest = countryDistribution.slice(displayLimit);
    const restSum = rest.reduce((sum, curr) => sum + curr.p, 0);

    if (showRest) {
        displayLimit += 1;
        toDisplay= toDisplay.concat([{ p: restSum, country: "Ostatné" }]);
    }
    
    new Chart(countryDistributionCanvas, {
        type: 'pie',
        data: {
            datasets: [{
                data: toDisplay.map(point => point.p),
                backgroundColor: new Array(displayLimit).fill().map(_ => getRandomColorString()),
                borderWidth: 0.5,
            }],
            labels: toDisplay.map(point => point.country),
        }
    });
});