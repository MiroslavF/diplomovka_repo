const sum = arr => arr.reduce((sum, curr) => sum + curr, 0);

function calculateRSD(dataPoints) {
    if (!dataPoints || !dataPoints.length) {
        throw new Error('No data');
    }
    if (sum(dataPoints) === 0) {
        return 0;
    }
    const mean = sum(dataPoints) / dataPoints.length;
    const standardDeviation = Math.sqrt(
        sum(dataPoints.map(value => Math.pow(value - mean, 2))) / dataPoints.length
    );
    return (standardDeviation / mean) * 100;
}

module.exports = calculateRSD;