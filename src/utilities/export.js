const fs = require("fs");
const database = require('../database');
const config = require('../config');

const networkTable = config.network.tableName;

async function edgeList(filename) {
    let writeStream = fs.createWriteStream(filename);
    const edges = await database(networkTable).select('a', 'b');
    for (let { a, b } of edges) {
        writeStream.write(`${a} ${b}\n`);
    }
    writeStream.end();
    console.log('Data export was successfull')
}
