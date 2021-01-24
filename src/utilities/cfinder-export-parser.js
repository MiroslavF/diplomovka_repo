const fs = require("fs");

function parseCommunities(communitiesFileContent) {
    let communityLines = communitiesFileContent.split('\n').filter(line => line.match(/^\d+:/));
    return communityLines.map((line) => {
        const nodes = line.trim().split(' ');
        return nodes.slice(1, nodes.length);
    });
}

function parseCommunitiesLinks(communitiesLinksFileContent) {
    const communitiesLinksParts = communitiesLinksFileContent.split(/\d+:/);
    communitiesLinksParts.shift();
    const communitiesLinks = communitiesLinksParts.map((part) => {
        return part.trim().split('\n').map(link => link.trim());
    })
    return communitiesLinks;
}


/**
 * resulting structure:
 *  {
 *      k=3: {
 *          communities: [
 *              "node1",
 *              "node2",
 *              ...
 *          ],
 *          communitiesLinks: [
 *              "node1 node2",
 *              "node2 node3"
 *          ]
 *      }
 *  }
 */
function parseCFinderExport(inputDirectory, outputFilename) {
    const data = {};
    const inputDirectoryPath = `${__dirname}/../../${inputDirectory}`;
    const entries = fs.readdirSync(inputDirectoryPath);
    for (let entry of entries) {
        if (entry.match(/k=\d+/)) {
            data[entry] = {};
            const communitiesFileContent = fs.readFileSync(`${inputDirectoryPath}/${entry}/communities`, { encoding: "utf8" });
            const communities = parseCommunities(communitiesFileContent);
            const communitiesLinksFileContent = fs.readFileSync(`${inputDirectoryPath}/${entry}/communities_links`, { encoding: "utf8" });
            const communitiesLinks = parseCommunitiesLinks(communitiesLinksFileContent);
            data[entry].communities = communities;
            data[entry].communitiesLinks = communitiesLinks;
        }
    }
    fs.writeFileSync(`${__dirname}/../../${outputFilename}`, JSON.stringify(data, null, 4));
    console.log(`${outputFilename} successfully created!`);
}

// parseCFinderExport('cfinder_export_files', 'cfinder-export-parsed.json');