/*

 * Path: '/server/api/technologies.js'
 * Author: Samis Moser
 * Desc: API-Endpoints (Technologies)

*/

// import packages
const express = require("express")
const knex = require("../db/connection")
const cors = require("cors")

// create instance of express router
var router = express.Router()

router.use(express.json())
router.use(cors())


// create instance of knex-connection object
var db = knex.connect()

// ENDPOINTS

// endpoint: [ GET '/api/technologies/' ]
router.get("/", (req, res) => {
    res.json({status:true,message:"success"})
})

// endpoint: [ GET '/api/technologies/getALl' ]
// returns all technologies from DB
router.get("/getAll", async (req, res) => {
    let result = await db("technologies")
    if(result === undefined) {
        res.status(500).json({status:false,message:"Interner Serverfehler"})
    }
    res.json({status:true,data:result})
})

// endpoint: [ GET '/api/technologies/getByProjectID' ]
// returns all technologies from specific project
router.get("/getByProjectID", async (req, res) => {
    let pid = req.query.pid
    if(pid === undefined || pid == "") {
        res.status(400).json({status:false,message:"invalid request"})
    }
    else {
        let result = await db("projectTechnologies").where({projectID:pid})
        if(result.length == 0) {
            res.status(404).json({status:false,message:"no technologies found for this project"})
        }
        else {
            let responseObj = []
            for(entry of result) {
                let tech = await db("technologies").where({ID:entry.technologyID})
                responseObj.push(tech)
            }
            res.json({status:true,data:responseObj})
        }
    }
})

// endpoint: [ POST '/api/technologies/add' ]
// adds technology to DB
router.post("/add", async (req, res) => {
    let title = req.body.title
    if(title == "" || title === undefined) {
        res.status(400).json({status:false,message:"ungültige Anfrage"})
    }
    
    let exists = await db("technologies").where({title:title})
   
    if(exists.length > 0) {
        res.status(400).json({status:false,message:"technologie existiert bereits"})
    }
    else {
        let add = await db("technologies").insert({title:title})

        if(add === undefined) {
            res.status(500).json({status:false,message:"interner Serverfehler"})
        }
        else {
            res.json({status:true})
        }   
    }
})

// endpoint: [ DELETE '/api/technologies/remove' ]
// removes specific technology from DB
router.delete("/remove", async (req, res) => {
    let id = req.body.id
    
    let del = await db("technologies").where({ID:id}).del()

    if(del !== undefined) {
        res.json({status:true})
    }
    else {
        res.status(500).json({status:false,message:"Interner Serverfehler"})
    }
})


// export router object
module.exports = router