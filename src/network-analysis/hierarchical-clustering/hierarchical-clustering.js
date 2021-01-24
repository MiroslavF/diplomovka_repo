const getClusteringCoefficient = require('../helpers/clustering-coefficient');
const getNodeToNeighboursMap = require('../helpers/node-to-neighbours-map');
const { cachingWrapper } = require('../../utilities');

const sum = arr => arr.reduce((a, b) => a + b);

async function calculateHierarchicalClustering() {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const degreeAndCoefficientPairs = Array.from(nodeToNeighboursMap)
        .map(([node, neighbours]) => ({ k: neighbours.length, c: getClusteringCoefficient(node, nodeToNeighboursMap) }))
        .filter(({ k, c }) => c !== null);
    const degreeToCoefficientsMap = new Map();
    for (let { k, c } of degreeAndCoefficientPairs) {
        let coefficients = degreeToCoefficientsMap.get(k);
        if (!coefficients) {
            coefficients = [];
            degreeToCoefficientsMap.set(k, coefficients);
        }
        coefficients.push(c);
    }
    return Array.from(degreeToCoefficientsMap).map(([k, coefficients]) => ({ k, ck: sum(coefficients) / coefficients.length }));
}

module.exports = cachingWrapper(calculateHierarchicalClustering, 'hierarchical-clustering');