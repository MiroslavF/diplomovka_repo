const fs = require('fs');

function getAllCommunities() {
    const data = fs.readFileSync(`${__dirname}/../../../cfinder-export-parsed.json`);
    return JSON.parse(data);
}

module.exports = getAllCommunities;