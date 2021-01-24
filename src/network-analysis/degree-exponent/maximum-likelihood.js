const getNodeToNeighboursMap = require('../helpers/node-to-neighbours-map');
const getNodeCount = require('../node-count');

async function calculateMaximumLikelihood() {
    const nodeCount = await getNodeCount();
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const degrees = Array.from(nodeToNeighboursMap.entries()).map(([node, neighbours]) => neighbours.length);
    const kMin = Math.min(...degrees);
    const tmpSum = degrees.reduce((sum, k) => sum + Math.log(k / kMin), 0);
    return 1 + (nodeCount / tmpSum);
}

module.exports = calculateMaximumLikelihood;