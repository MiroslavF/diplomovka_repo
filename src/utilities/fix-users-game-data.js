const config = require('../config');
const database = require('../database');

const userOwnedGamesTable = config.steam.userOwnedGamesTable;
const usersTable = config.steam.usersTable;

async function fixUsersGameData() {
    let usersWithGames = await database.select('user_steam_id').distinct('user_steam_id').from(userOwnedGamesTable);
    usersWithGames = new Set(usersWithGames.map(user => user.user_steam_id));
    await database(usersTable).update({ game_data: 0 });
    for (let user of usersWithGames) {
        await database(usersTable).update({ game_data: 1 }).where({ steam_id: user });
    }
    console.log('Done!')
}

fixUsersGameData();