/*

 * Path: '/server/api/projects.js'
 * Author: Samis Moser
 * Descriptopn: API-Endpoints (Projects-Route)

*/

// import packages
const express = require("express")
const knex = require("../db/connection")
const cors = require("cors")
const axios = require("axios")

const config = require("../config.json")

// create instance of express router
var router = express.Router()

router.use(express.json())
router.use(cors())

// create instance of knex-connection object
var db = knex.connect()

// functions

// function to convert UNIX-Timestamp to date-String
// example: 1583020800000 => "2020-03-01"
const convertDate = (UNIXtimestamp) => {
    var a = new Date(UNIXtimestamp)
    var year = a.getFullYear()
    var month = a.getMonth()+1
    if(month < 10) {
        month = "0"+month
    }
    var date = a.getDate()
    if(date < 10) {
        date = "0"+date
    }
    var result = `${year}-${month}-${date}`
    return result
}


// ENDPOINTS

// endpoint: [ GET '/api/projects' ]
router.get("/", (req, res) => {
    res.json({status:true,message:"success"})
})

// endpoint: [ GET '/api/projects/getByUser' ]
// returns all projects of specific user
router.get("/getByUser", async(req, res) => {
    let userID = req.query.uid

    let result = await db("projects").where({ownerID:userID})

    if(result.length < 1) {
        res.status(404).json({status:false,message:"no projects found"})
    }
    res.json({status:true,message:"success",data:result})
})

// endpoint: [ GET '/api/projects/getCountByUser' ]
// returns count of projects from specific user
router.get("/getCountByUser", async (req, res) => {
    let uid = req.query.uid

    if(uid == undefined) {
        res.status(400).json({status:false,message:"invalid request"})
    }
    else {
        let response = await db("projects").where({ownerID:uid}).count("ID as count")

        res.json({status:true,data:response[0].count})
    }
})

// endpoint: [ GET '/api/projects/getProject' ]
// returns specific project object
router.get("/getProject", async(req, res) => {
    let pid = req.query.pid
    if(pid === undefined) {
        res.status(400).json({status:false,message:"ungültige anfrage"})
    }
    else {
        let result = await db("projects").where({ID:pid})
        if(result.length == 0) {
            res.status(404).json({status:false,message:"projekt nicht gefunden"})
        }
        else {
            res.json({status:true,data:result[0]})
        }
    }
})

// endpoint: [ GET '/api/projects/getReadme' ]
// returns content of README.md-file from gitlab-URL
router.get("/getReadme", async (req, res) => {
    let url = req.query.url.split("/")

    let user = url[3]
    let project = url[4]
    
    let baseUrl = "https://git.it-tf.ch/api/v4/projects/"
    if(url === undefined) {
        res.status(401).json({status:false,message:"no url given"})
    }
    else {
        let opt = {
            headers: {
                "PRIVATE-TOKEN": config.connections.gitlab.token
            }
        }
        let urlEnc = encodeURIComponent(`${user}/${project}`)
        let finalUrl = baseUrl+urlEnc+"/repository/files/README.md/raw?ref=master"
        axios.get(finalUrl, opt)
        .then(resp => {
            res.json({status:true,data:resp.data})
        })
        .catch(err => {
            console.log("ERRRRRROR")
            console.log(JSON.stringify(err))
            res.json({status:false,message:"error while parsing url"})
        })
    }
})

// endpoint: [ GET '/api/projects/getAll' ]
// returns all projects
router.get("/getAll", async(req, res) => {
    let result = await db("projects")
    if(result === undefined || result.length == 0) {
        res.status(500).json({status:false,message:"server error"})
    }
    else {
        res.json({status:true,data:result})
    }
})


// endpoint: [ POST '/api/projects/search' ]
// returns array of projects matching classes array + query String
router.post("/search", async (req, res) => {
    let classes = req.body.classes
    let query = req.body.query
    let all 
    if(classes.length == 2) {
        all = await db("projects")

    }
    else {
        all = await db("projects")
        .join("users", {"users.ID":"projects.ownerID"})
        .where({"users.class":classes[0]})
    }
    let result = []

    all.forEach(entry => {
        let titleMatch = entry.title.toLowerCase().includes(query.toLowerCase())
        let descMatch = entry.desc.toLowerCase().includes(query.toLowerCase())
        let dateMatch = convertDate(entry.start).includes(query) || convertDate(entry.end).includes(query)
        if(titleMatch || descMatch || dateMatch) {
            result.push(entry)
        }
    })
    if(result.length > 0) {
        res.json({status:true,data:result})
    }
    else {
        res.status(404).json({status:false,message:"not found"})
    }
    
})

// endpoint: [ POST '/api/projects/new' ]
// creates new Project entry in the DB
router.post("/new", async (req, res) => {
    let inputs = req.body.inputs
    let valid = false
    if(inputs === undefined || !inputs) {
        res.status(400).json({status:false,message:"invalid request"})
    } 
    let exists = await db("projects").where({title:inputs.title})
    if(exists.length > 0) {
        res.status(409).json({status:false,message:`Ein Projekt mit dem Titel '${inputs.title}' existiert bereits`})
    }
    else {
        valid = true
    }

    console.log(inputs)
    if(inputs.contributors == "") inputs.contributors = null
    if(inputs.gitlab == "") inputs.gitlab = null
    if(inputs.trello == "") inputs.trello = null
    if(inputs.status == "-") inputs.status = null
    
    console.log(inputs)
    if(valid) {
        let newProject = await db("projects").insert({
            title: inputs.title,
            client: inputs.client,
            desc: inputs.desc,
            start: inputs.start,
            end: inputs.end,
            timeExpected: inputs.timeExpected,
            contributors: inputs.contributors,
            status: inputs.status,
            gitlab: inputs.gitlab,
            trello: inputs.trello,
            ownerID: inputs.owner
        })
        .catch(err => {
            res.status(500).json({status:false,message:JSON.stringify(err)})
        })
        if(newProject) {

            let projectID = await db("projects").where({title:inputs.title})
            projectID = projectID[0].ID

            inputs.technologies.forEach(async tech => {
                let newProjectTechnology = await db("projecttechnologies").insert({
                    projectID: projectID,
                    technologyID: tech.ID
                })
                if(newProjectTechnology) {
                    res.json({status:true})
                }
            })
            
        }
    }
    
    
})


// endpoint: [ PUT '/api/projects/edit' ]
// edits project entry
router.put("/edit", async (req, res) => {
    let inputs = req.body.inputs
    if(inputs === undefined) {
        res.status(400).json({status:false,message:"invalid request"})
    }
    else {
        
        if(inputs.status == "-") inputs.status = null
        if(inputs.gitlab == "") inputs.gitlab = null
        if(inputs.trello == "") inputs.trello = null
        if(inputs.contributors != null) inputs.contributors = inputs.contributors.join(",")
        let update = await db("projects").where({title:inputs.title}).update({
            title: inputs.title,
            client: inputs.client,
            desc: inputs.desc,
            start: inputs.start,
            end: inputs.end,
            timeExpected: inputs.timeExpected,
            contributors: inputs.contributors,
            trello: inputs.trello,
            gitlab: inputs.gitlab,
            status: inputs.status
        })
        let rem = await db("projecttechnologies").where({projectID:req.body.projectID}).del()
        inputs.technologies.forEach(async technology => {
            let add = await db("projecttechnologies").insert({projectID:req.body.projectID,technologyID:technology.ID})
        })

        if(update === undefined) {
            res.status(500).json({status:false,message:"internal server error"})
        }
        else {
            res.json({status:true})
        }
    }
})

// endpoint: [ DELETE '/api/projects/remove' ]
// removes specific project from DB
router.delete("/remove", async (req, res) => {
    let pid = req.body.pid
    if(pid === undefined) {
        res.status(400).json({status:false,message:"invalid request"})
    }
    else {
        let removeProject = await db("projects").where({ID:pid}).del()
        let removeProjectTechnologies = await db("projecttechnologies").where({projectID:pid}).del()

        if(removeProject == undefined || removeProjectTechnologies == undefined) {
            res.status(500).json({status:false,message:"internal server error"})
        }
        else {
            res.json({status:true})
        }
    }
})


// export router object
module.exports = router