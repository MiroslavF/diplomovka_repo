const { cachingWrapper } = require('../utilities');
const getNodeCount = require('./node-count');
const getEdgeCount = require('./edge-count');

async function calculateAverageNodeDegree() {
    const nodeCount = await getNodeCount();
    const edgeCount = await getEdgeCount();

    return 2 * edgeCount / nodeCount;
}

module.exports = cachingWrapper(calculateAverageNodeDegree, 'average-node-degree');
