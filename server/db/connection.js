/*

 * Path: '/server/db/connection.js'
 * Author: Samis Moser
 * Desc: Connection-File for Database-Requests

*/

const config = require("../config.json")

var knex = require("knex")({
    client: "mysql",
    connection: {
        host: config.connections.database.host,
        user: config.connections.database.user,
        password: config.connections.database.pass,
        database: config.connections.database.database
    }
})

module.exports = {
    connect: () => {
        return knex
    }
}