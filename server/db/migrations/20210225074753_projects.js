/*

 * Path: '/server/db/migrations/20210225074753_projects.js'
 * Author: Samis Moser
 * Desc: Migrations for table 'projects'

*/
exports.up = function(knex) {
    return knex.schema.createTable('projects', (table) => {
        table.increments('ID')
        table.string('title').notNullable().unique()
        table.specificType('desc','longtext').notNullable()
        table.bigInteger('start').notNullable()
        table.bigInteger('end').notNullable()
        table.integer('timeExpected').notNullable()
        table.string('client').notNullable()
        table.specificType('contributors','longtext')
        table.enum('status', ['planned','active','done'])
        table.string('gitlab')
        table.string('trello')
        table.integer('ownerID').notNullable()
    })    
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('projects')
};
