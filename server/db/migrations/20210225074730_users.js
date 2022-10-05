/*

 * Path: '/server/db/migrations/20210225074730_users.js'
 * Author: Samis Moser
 * Desc: Migrations for table 'users'

*/
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('ID')
        table.string('username').notNullable().unique()
        table.string('fullname').notNullable()
        table.string('class')
        table.string('section').notNullable()
        table.enum('perm', ['Lernender', 'Lehrperson'])
    })    
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users')
};
