const { cachingWrapper } = require('../utilities');
const getNodeToNeighboursMap = require('./helpers/node-to-neighbours-map');
const calculateRandomizedNetworkMap = require('./helpers/degree-preserving-randomization');
const config = require('../config');

const randomizationIterations = config.analysis.degreeCorrelations.randomizationIterations;

function getAverageNeighbourDegree(node, nodeToNeighboursMap) {
    const neighbours = nodeToNeighboursMap.get(node);
    const neighbourDegreeSum = neighbours
        .reduce((sum, neighbour) => sum + nodeToNeighboursMap.get(neighbour).length, 0);
    return neighbourDegreeSum / neighbours.length;
}

function getDegreeCorrelation(k, nodeToNeighboursMap) {
    const kDegreeNodes = [];
    for (let [node, neighbours] of nodeToNeighboursMap) {
        if (neighbours.length === k) {
            kDegreeNodes.push(node);
        }
    }
    const neighboursAverageDegreeSum = kDegreeNodes
        .reduce((sum, node) => sum + getAverageNeighbourDegree(node, nodeToNeighboursMap), 0);
    return neighboursAverageDegreeSum / kDegreeNodes.length;
}

function calculateDegreeCorrelationsFromMap(nodeToNeighboursMap) {
    const degrees = Array.from(new Set(
        Array.from(nodeToNeighboursMap.entries()).map(([_, neighbours]) => neighbours.length)
    ));
    return degrees.map(k => ({ k, knn: getDegreeCorrelation(k, nodeToNeighboursMap) }));
}

async function calculateDegreeCorrelations() {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    return calculateDegreeCorrelationsFromMap(nodeToNeighboursMap);
}

async function calculateRandomizedDegreeCorrelations() {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const randomizedMap = calculateRandomizedNetworkMap(nodeToNeighboursMap, randomizationIterations);
    return calculateDegreeCorrelationsFromMap(randomizedMap);
}

module.exports = {
    getDegreeCorrelations: cachingWrapper(calculateDegreeCorrelations, 'degree-correlations'),
    getRandomizedDegreeCorrelations: cachingWrapper(calculateRandomizedDegreeCorrelations, 'degree-correlations-randomized'),
}