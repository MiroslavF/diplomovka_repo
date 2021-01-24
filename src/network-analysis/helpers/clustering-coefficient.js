function intersection(fst, snd) {
    return new Set(fst.filter(item => snd.includes(item)));
}

function calculateClusteringCoefficient(node, nodeToNeighboursMap) {
    const neighbours = nodeToNeighboursMap.get(node);
    const degree = neighbours.length;
    if (degree === 1) {
        return null;
    }
    const neighbourLinkCount = neighbours
        .map(neighbour => intersection(neighbours, nodeToNeighboursMap.get(neighbour)).size)
        .reduce((a, b) => a + b);
    return neighbourLinkCount / (degree * (degree - 1));
}

module.exports = calculateClusteringCoefficient;