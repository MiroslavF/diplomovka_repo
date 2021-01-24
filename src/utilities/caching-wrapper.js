const fs = require('fs');
const config = require('../config');

function cachingWrapper(calculate, statisticName, cacheSubfolder = 'networks') {
    const tableName = config.network.tableName;
    const dirPath = `${__dirname}/../../cache/${cacheSubfolder}`;
    let fileName = `${tableName}-${statisticName}.json`;
    if (cacheSubfolder !== 'networks') {
        fileName = `${statisticName}.json`;
    }
    const filePath = `${dirPath}/${fileName}`;
    return async function() {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath);
            return JSON.parse(data);
        }
        const data = await calculate();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`${fileName} successfully created`)
        return data;
    }
}

module.exports = cachingWrapper;