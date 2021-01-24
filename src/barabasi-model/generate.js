const config = require('../config');
const database = require('../database');

const targetNodeCount = config.barabasiModel.generate.targetNodeCount;
const edgeIncrement = config.barabasiModel.generate.edgeIncrement;
const tableName = config.barabasiModel.tableName;

function generate() {
    let nodes = buildInitialGraph()
    while (nodes.length < targetNodeCount) {
        newNode = { id: nodes.length, neighbourIds: [] }
        for (let i = 0; i < edgeIncrement; i++) {
            connectNewNode({ newNode, nodes })
        }
        nodes.push(newNode)
    }
    return nodes
}
function buildInitialGraph() {
    return [
        { id: 0, neighbourIds: [1, 2, 3] },
        { id: 1, neighbourIds: [0, 2, 3] },
        { id: 2, neighbourIds: [0, 1, 3] },
        { id: 3, neighbourIds: [0, 1, 2] }
    ]
}
function connectNewNode({ newNode, nodes }) {
    newNeighbourId = getNewNeighbourId(nodes)
    while (newNode.neighbourIds.includes(newNeighbourId)) {
        newNeighbourId = getNewNeighbourId(nodes)
    }
    newNode.neighbourIds.push(newNeighbourId)
    nodes[newNeighbourId].neighbourIds.push(newNode.id)
}
function getNewNeighbourId(nodes) {
    let degreeSum = getDegreeSum(nodes)
    let target = getRandomInt(degreeSum)
    let degreeCount = 0
    for (let i = 0; i < nodes.length; i++) {
        let currentNodeDegree = nodes[i].neighbourIds.length
        if (degreeCount + currentNodeDegree > target) {
            return nodes[i].id
        }
        degreeCount += currentNodeDegree
    }
}
function getDegreeSum(nodes) {
    return nodes.reduce((sum, node) => sum + node.neighbourIds.length, 0)
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function insertNetwork(nodes) {
    const rows = [];
    for (let node of nodes) {
        for (let neighbour of node.neighbourIds) {
            if (!edgeExists(node.id, neighbour, rows)) {
                rows.push({ a: node.id, b: neighbour });
            }
        }
    }
    await database(tableName).insert(rows);
}

function edgeExists(a, b, rows) {
    return rows.some(row => (row.a === a && row.b === b) || (row.a === b && row.b === a));
}

async function generateNetworkTable() {
    const network = generate();
    await insertNetwork(network);
    console.log(`${tableName} network has been successfully generated`)
}