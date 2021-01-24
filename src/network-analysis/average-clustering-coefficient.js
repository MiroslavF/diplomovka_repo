const getNodeToNeighboursMap = require('./helpers/node-to-neighbours-map');
const getClusteringCoefficient = require('./helpers/clustering-coefficient');
const { cachingWrapper } = require('../utilities');

const sum = (arr) => arr.reduce((sum, cur) => sum + cur, 0);

async function calculateAverageClusteringCoefficient() {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const nodes = Array.from(nodeToNeighboursMap.keys());
    let coefficients = nodes
        .map(node => getClusteringCoefficient(node, nodeToNeighboursMap))
        .filter(c => c !== null);
    return sum(coefficients) / coefficients.length;
}

module.exports = cachingWrapper(calculateAverageClusteringCoefficient, 'average-clustering-coefficient');