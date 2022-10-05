/*

 * Path: '/server/db/seeds/technologies.js'
 * Author: Samis Moser
 * Desc: Seeds for table 'technologies'

*/
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('technologies').del()
    .then(function () {
      // Inserts seed entries
      return knex('technologies').insert([
        {ID:9,title: 'HTML'},
        {ID:10,title: 'VueJS'},
        {ID:11,title: 'Python'},
        {ID:12,title: 'godot-Engine'},
        {ID:13,title: 'JavaScript'},
        {ID:14,title: 'React'},
        {ID:15,title: 'SQL'},
        {ID:16,title: 'ActiveDirectory'}
      ]);
    });
};
