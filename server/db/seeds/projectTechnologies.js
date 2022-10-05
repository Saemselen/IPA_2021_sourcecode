/*

 * Path: '/server/db/seeds/projectTechnologies.js'
 * Author: Samis Moser
 * Desc: Seeds for table 'projectTechnologies'

*/
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('projecttechnologies').del()
    .then(function () {
      // Inserts seed entries
      return knex('projecttechnologies').insert([
        {projectID:1,technologyID:13},
        {projectID:1,technologyID:9},
        {projectID:1,technologyID:10},
        {projectID:2,technologyID:11},
        {projectID:3,technologyID:13},
        {projectID:3,technologyID:10},
        {projectID:4,technologyID:13},
        {projectID:5,technologyID:12},
        {projectID:5,technologyID:11},
        {projectID:6,technologyID:13},
        {projectID:7,technologyID:13},
        {projectID:8,technologyID:11},
        {projectID:9,technologyID:13},
        {projectID:10,technologyID:16},
        {projectID:11,technologyID:13},
        {projectID:12,technologyID:11},
        {projectID:13,technologyID:13},
        {projectID:13,technologyID:9},
        {projectID:14,technologyID:11},
        {projectID:15,technologyID:13},
        {projectID:15,technologyID:9},
        {projectID:16,technologyID:13},
        {projectID:17,technologyID:13},
        {projectID:17,technologyID:10}
      ]);
    });
};
