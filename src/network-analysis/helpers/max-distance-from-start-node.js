const getNodeToNeighboursMap = require('./node-to-neighbours-map');

async function getMaxDistanceFromStartNode() {
    const startNode = '76561198082367921';
    const nodeToNeighboursMap = await getNodeToNeighboursMap();
    const queue = [[startNode, 0]];
    const visited = new Set();
    const queuedNodes = new Set();
    let maxDist = 0;
    while (queue.length) {
        const [current, dist] = queue.shift();
        maxDist = Math.max(maxDist, dist);
        visited.add(current);
        const neighbours = nodeToNeighboursMap.get(current);
        for (let neighbour of neighbours) {
            if (!visited.has(neighbour) && !queuedNodes.has(neighbour)) {
                queue.push([neighbour, dist + 1]);
                queuedNodes.add(neighbour);
            }
        }
    }
    return maxDist;
}

module.exports = getMaxDistanceFromStartNode;