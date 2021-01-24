function replace(array, itemToReplace, replacement) {
    const index = array.indexOf(itemToReplace);
    if (index < 0) {
        throw new Error("Item that you want to replace is not in the array");
    }
    array[index] = replacement;
}

function chooseRandomNode(nodes, forbidden) {
    const chosen = nodes[Math.floor(nodes.length * Math.random())]
    if (forbidden && forbidden.includes(chosen)) {
        return chooseRandomNode(nodes, forbidden);
    }
    return chosen;
}

function calculateRandomizedNetworkMap(nodeToNeighboursMap, iterations) {
    nodeToNeighboursMapCopy = new Map(nodeToNeighboursMap);
    const nodes = Array.from(nodeToNeighboursMapCopy.keys());
    let skippedCount = 0;
    for (let i = 0; i < iterations; i++){
        console.log(`Randomized network map: iteration ${i}`);
        for (let fromNode1 of nodes) {
            try {
                let toNode1 = chooseRandomNode(nodeToNeighboursMapCopy.get(fromNode1));
                let fromNode2 = chooseRandomNode(nodes, [fromNode1, toNode1, ...nodeToNeighboursMapCopy.get(toNode1)])
                let toNode2 = chooseRandomNode(nodeToNeighboursMapCopy.get(fromNode2), [fromNode1, toNode1, ...nodeToNeighboursMapCopy.get(fromNode1)]);
                replace(nodeToNeighboursMapCopy.get(fromNode1), toNode1, toNode2);
                replace(nodeToNeighboursMapCopy.get(fromNode2), toNode2, toNode1);
            } catch(err) {
                if (err instanceof RangeError) {
                    skippedCount++;
                    console.log(`Skipping...skipped count = ${skippedCount}`);
                    continue;
                }
            } 
        }
    }
    return nodeToNeighboursMapCopy;
}

module.exports = calculateRandomizedNetworkMap