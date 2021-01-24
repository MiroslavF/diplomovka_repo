const Deque = require("double-ended-queue");
const { cachingWrapper } = require('../utilities');
const getNodeToNeighboursMap = require('./helpers/node-to-neighbours-map');

async function calculateDistanceDistribution() {
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const nodeCount = nodeToNeighboursMap.size;
    const nodes = nodeToNeighboursMap.keys();
    const distanceFrequencyMap = new Map();
    
    function calculateDistances(startNode) {
        const queue = new Deque(nodeCount);
        queue.push([startNode, 0]);
        const reachedNodes = new Set([startNode]);
        while (!queue.isEmpty()) {
            let [node, distance] = queue.shift();
            if (!distanceFrequencyMap.has(distance)) {
                distanceFrequencyMap.set(distance, 0);
            }
            distanceFrequencyMap.set(distance, distanceFrequencyMap.get(distance) + 1);

            if (reachedNodes.size < nodeCount) {
                let neighbours = nodeToNeighboursMap.get(node);
                for (let neighbour of neighbours) {
                    if (!reachedNodes.has(neighbour)) {
                        queue.push([neighbour, distance + 1]);
                        reachedNodes.add(neighbour);
                    }
                }
            }
        }
    }

    let processedNodeCount = 0;
    for (let node of nodes) {
        calculateDistances(node);
        console.log('Calculating distance distribution: Processed nodes =', ++processedNodeCount);
    }

    distanceFrequencyMap.delete(0);
    let distanceFrequencyPairs = Array.from(distanceFrequencyMap.entries());
    distanceFrequencyMapEntries = distanceFrequencyPairs.map(([distance, frequency]) => ([distance, frequency / 2]));
    const totalPaths = distanceFrequencyMapEntries.reduce((pathCount, [_, frequency]) => pathCount + frequency, 0);
    return distanceFrequencyMapEntries.map(([distance, frequency]) => ({ d: distance, pd: frequency / totalPaths }));
}

module.exports = cachingWrapper(calculateDistanceDistribution, 'distance-distribution');