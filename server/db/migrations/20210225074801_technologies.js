/*

 * Path: '/server/db/migrations/20210225074801_technologies.js'
 * Author: Samis Moser
 * Desc: Migrations for table 'technologies'

*/
exports.up = function(knex) {
    return knex.schema.createTable('technologies', (table) => {
        table.increments('ID')
        table.string('title').notNullable()
    })    
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('technologies')
};
