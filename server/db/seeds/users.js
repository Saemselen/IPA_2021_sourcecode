/*

 * Path: '/server/db/seeds/users.js'
 * Author: Samis Moser
 * Desc: Seeds for table 'users'

*/
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {ID:4,username:"samo",fullname:"Samis Moser",class:"18",section:"BI",perm:"Lernender"},
        {ID:5,username:"libe",fullname:"Liam Benedetti",class:"18",section:"BI",perm:"Lernender"},
        {ID:6,username:"mamu",fullname:"Masato Mumentaler",class:"18",section:"BI",perm:"Lernender"},
        {ID:7,username:"ansc",fullname:"Andrin Schranz",class:"18",section:"BI",perm:"Lernender"},
        {ID:8,username:"doke",fullname:"Dominik Keller",class:"17",section:"BI",perm:"Lernender"},
        {ID:9,username:"heba",fullname:"Hezekiah Bakare-Johnson",class:"17",section:"BI",perm:"Lernender"},
        {ID:10,username:"adpu",fullname:"Adshay Puspanathan",class:"18",section:"BI",perm:"Lernender"},
        {ID:11,username:"nisi",fullname:"Niroj Sivananthan",class:"18",section:"BI",perm:"Lernender"},
        {ID:12,username:"nofe",fullname:"Noah Ferrari",class:"18",section:"BI",perm:"Lernender"},
        {ID:13,username:"vivi",fullname:"Vinujhan Vivilananthan",class:"18",section:"BI",perm:"Lernender"},
        {ID:14,username:"kaja",fullname:"Kavindu Jasin Pathiranage",class:"18",section:"BI",perm:"Lernender"},
        {ID:15,username:"mama",fullname:"Marija Makic",class:"18",section:"BI",perm:"Lernender"},
        {ID:16,username:"rahe",fullname:"Rayan Henchiri",class:"17",section:"BI",perm:"Lernender"},
        {ID:17,username:"kldu",fullname:"Klara Duricova",class:"18",section:"BI",perm:"Lernender"},
        {ID:18,username:"jach",fullname:"James Chibuzor",class:"17",section:"BI",perm:"Lernender"},
        {ID:19,username:"yaan",fullname:"Yannis Anderegg",class:"18",section:"BI",perm:"Lernender"},
        {ID:20,username:"usha",fullname:"Usman Ahmad Hashmi",class:"18",section:"BI",perm:"Lernender"}
      ]);
    });
};
