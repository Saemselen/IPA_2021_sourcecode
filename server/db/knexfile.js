/*

 * Path: '/server/db/knexfile.js'
 * Author: Samis Moser
 * Desc: Knexfile for Database-Requests ( Migrations + Seeds )

*/

// import config
const config = require("../config.json")

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: config.connections.database.host,
      database: config.connections.database.database,
      user: config.connections.database.user,
      password: config.connections.database.pass
    }
  }
};
