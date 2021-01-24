const knex = require('knex');
const config = require('../config');

const database = knex({
	client: 'mysql',
	connection: {
		host: config.database.host,
		user: config.database.user,
		password: config.database.pass,
		database: config.database.name,
		port: config.database.port,
		charset: 'utf8',
	},
});

module.exports = database;