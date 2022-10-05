/*

 * Path: '/server/db/migrations/20210225074812_projectTechnologies.js'
 * Author: Samis Moser
 * Desc: Migrations for table 'projectTechnologies'

*/
exports.up = function(knex) {
    return knex.schema.createTable('projectTechnologies', (table) => {
        table.increments('ID')
        table.integer('projectID').notNullable()
        table.integer('technologyID').notNullable()
    })    
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('projectTechnologies')
};
