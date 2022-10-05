/*

 * Path: '/server/db/seeds/projects.js'
 * Author: Samis Moser
 * Desc: Seeds for table 'projects'

*/
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('projects').del()
    .then(function () {
      // Inserts seed entries
      return knex('projects').insert([
        {ID:1,ownerID:4,title:"Webapplikation zur Projektverwaltung",desc:"Webapplikation zur Verwaltung von abteilungsinternen Projekten und zum Bundeln verschiederner Plattformen",start:1581897600000,end:1583366400000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:2,ownerID:5,title:"Videobasiertes Personenzählsystem",desc:"Videosystem zur Überwachung von Personenverkehr während der Pandemie",start:1613520000000,end:1614902400000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:3,ownerID:6,title:"Überarbeitung Webapp Cleantech-Award",desc:"Webapplikation für den cleantech-Award",start:1614124800000,end:1615507200000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:4,ownerID:7,title:"Noten online erfassen",desc:"Webapplikation zum erfassen der Noten in der Schule",start:1614124800000,end:1615507200000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:5,ownerID:8,title:"Informations-Game zur Technischen Fachschule",desc:"Videospiel als Informationsmedium",start:1615334400000,end:1616544000000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:6,ownerID:9,title:"Android-Applikation zur Erfassung von Noten",desc:"Applikation zum Erfassen von Schulnoten",start:1614124800000,end:1614902400000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:7,ownerID:10,title:"Weinkeller",desc:"Webapplikation zur Verwaltung einer Weinsammlung",start:1616371200000,end:1618185600000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:8,ownerID:11,title:"Angebots-App",desc:"Webapplikation (Webshop) für Applikationen (Kundenaufträge)",start:1613520000000,end:1614902400000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:9,ownerID:12,title:"Absenzenmanager",desc:"Webapplikation zum Verwalten von Absenzen",start:1615334400000,end:1616716800000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:10,ownerID:13,title:"Integration von Linux Systemen",desc:"Linux Systeme über Active-Directory authentifizieren",start:1613692800000,end:1615420800000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:11,ownerID:14,title:"Artikelverwaltungs-App",desc:"Webapplikation zur Verwaltung eines Inventars",start:1614902400000,end:1616716800000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:12,ownerID:15,title:"Bilderverwaltungs-App",desc:"Webapp zur Verwaltung von Bildern der Events an der Schule",start:1614124800000,end:1615507200000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:13,ownerID:16,title:"Webapp zur Erfassung von Ereignisprotokollen",desc:"Webapp zum Erfassen von Ereignisprotokollen (Disziplinarmassnahmen)",start:1614297600000,end:1615766400000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:14,ownerID:17,title:"Snake-Spiel für Arcade Automat",desc:"Implementation eines Snake-Game für einen abteilungsinternen Arcade-Automaten",start:1614297600000,end:1616025600000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:15,ownerID:18,title:"Bildungsbericht Webapp",desc:"Webapplikation zur Erfassung von Bildungsberichte",start:1614124800000,end:1615334400000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:16,ownerID:19,title:"Aufgabenmanager",desc:"Webapplikation zur Verwaltung von Tasks",start:1582502400000,end:1584576000000,timeExpected:80,client:"Technische Fachschule Bern"},
        {ID:17,ownerID:20,title:"Arbeitsjournal",desc:"Webapplikation zur Verwaltung von Arbeitsjournalen",start:1583020800000,end:1584576000000,timeExpected:80,client:"Technische Fachschule Bern"},
      ]);
    });
};
