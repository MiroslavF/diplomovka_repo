const propertyCorrelationsCanvas = document.getElementById('propertyCorrelations');

axios.get(`${apiUrl}/property-correlations`).then((response) => {
    const {
        baseProperty,
        propertyCorrelations,
    } = response.data;
    function getRandomColorString() {
        const randint = max => Math.floor(Math.random() * max);
        return `rgb(${randint(255)}, ${randint(255)}, ${randint(255)})`
    }

    const propertyTranslations = {
        friendsCount: "počet priateľov",
        steamLevel: "steam level",
        gameCount: "počet hier",
        playtime: "počet nahratých hodín",
        sameCountryNeighboursFraction: "pocet priatelov s rovnakou krajinou",
        yearsRegistered: "počet rokov v sieti",
        communitiesMember: "počet komunit",
        maxJoiningCommunities: "počet spájaných komunít",
        topGamesGiniCoefficient: "gini coefficient top hier",
    };

    const withoutBaseProperty = Object.keys(propertyTranslations).filter(prop => prop !== baseProperty);

    const datasets = withoutBaseProperty.map(property => {
        let propertyColor = getRandomColorString();
        let dataPoints = propertyCorrelations
            .map(obj => ({ x: obj[baseProperty], y: obj.normalizedAverages[property] }))
            .filter(point => point.y !== null);
        return {
            showLine: true,
            fill: false,
            pointRadius: 0,
            label: propertyTranslations[property],
            backgroundColor: propertyColor,
            borderColor: propertyColor,
            data: dataPoints,
        };
    });

    new Chart(propertyCorrelationsCanvas, {
        type: 'line',
        data: {
            datasets,
        },
        options: {
            title: {
                display: true,
                text: 'Property correlations'
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: `${propertyTranslations[baseProperty]}`,
                        fontSize: 18,
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: false
                    },
                    ticks: {
                        min: 0,
                        max: 1,
                        display: false,
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