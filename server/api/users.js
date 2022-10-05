/*

 * Path: '/server/api/users.js'
 * Author: Samis Moser
 * Desc: API-Endpoints (Users)

*/

// import config-file
const config = require("../config.json")

// import packages
const express = require("express")
const ActiveDirectory = require("activedirectory2")
const jwt = require("modjwt")
const knex = require("../db/connection")
const cors = require("cors")

// create instance of express router
var router = express.Router()

router.use(express.json())
router.use(cors())


// create instance of knex-connection object
var db = knex.connect()

// create instance of activedirectory
var ad = new ActiveDirectory(config.connections.activedirectory)

// functions

// [function] change format of key-value-pair from 'OU=18' to only '18' (value)
const getDNValue = (dnString) => {
    return dnString.split("=")[1]
}

// [function] authenticate user with sAMAccountName + password
// returns status 'true' if the user could be authenticated using
// the given credentials, else it returns 'false'
const authUser = (username, password) => {
    return new Promise(resolve => {
        let status = false
        let responseObj = {}

        let adUser = `${username}@it-tf.local`

        ad.authenticate(adUser, password, (err, auth) => {
            if(err) {
                // error while performing LDAP request
                responseObj.error = JSON.stringify(err)
            }
            else {
                // set status to 'auth'-variable, which is either 'true'
                // if the authorisation succeeded or 'false' if it failed
                status = auth
                if(!status) {
                    responseObj.error = "authentification failed"
                }
            }
            responseObj.status = status
            resolve(responseObj)
        })
    })
}


// [function] get user by sAMAccountName
// returns status 'true' if user was found, else it returns false'
const findUser = (sAMAccountName) => {
    return new Promise(resolve => {
        let status = false
        let userData
        let responseObj = {}
        ad.findUser(sAMAccountName, (err, user) => {
            if(err) {
                // error while performing LDAP request
                responseObj.error = err
            }
            if(!user) {
                // user does not exist in AD
                responseObj.error = "user not found"
            }
            else {
                // user exists
                let userclass = getDNValue(user.dn.split(",")[1])

                status = true
                userData = {
                    username: user.sAMAccountName,
                    fullname: user.cn,
                    class: userclass,
                    section: getDNValue(user.dn.split(",")[2])
                }
                
            }
            responseObj.data = userData
            responseObj.status = status
            resolve(responseObj)
        })
    })
}

// ENDPOINTS


// endpoint: [ GET '/api/users/' ]
router.get("/", (req, res) => {
    res.json({status:true,message:"user-endpoint"})
})

// endpoint: [ POST '/api/users/authenticate' ]
// authenticates user ( username, password ) with LDAP
router.post("/authenticate", async (req, res) => {
    let query = req.body

    // check if sent username & passwort are undefined or empty => send error
    if(query.username == undefined || query.password == undefined || query.username == "" || query.password == "") {
        res.status(401).json({status:false,error:true,message:"invalid request"})
    }
    
    let userFound = await findUser(query.username)

    if(userFound.status == false) {
        // user not found in AD
        res.status(404).json({status:false,error:true,message:"Benutzer '"+query.username+"' wurde nicht gefunden"})
    }
    else {
        // user found in AD
        let userAuth = await authUser(query.username, query.password)
        if(userAuth.status) {
            // user authenticated
            res.json({status:true,error:false,message:"success",userData:userFound.data})
        }
        else {
            // user not authenticated
            res.status(401).json({status:false,error:true,message:"ungültiges Passwort"})
        }
    }
})

// endpoint: [ GET '/api/users/checkLocalUser' ]
// returns 'true' if local user with this username exists
router.get("/checkLocalUser", async (req, res) => {
    let username = req.query.username
    if(username == undefined) {
        res.status(400).json({status:false,message:"bad request"})
    }
    else {
        if(username != "") {
            let result = await db("users").where({username:username})
            result = result.length > 0
            res.json({userExists:result})
        }
        else {
            res.status(400).json({status:false,message:"bad request"})
        }
    }
    
})

// endpoint: [ PUT '/api/users/createLocalUser' ]
// creates local user from LDAP user-object
router.put("/createLocalUser", async (req, res) => {
    let userData = req.body.userData

    let check = userData.username == "" || userData.fullname == "" || userData.class == "" || userData.section == ""

    if(!check) {
        // all values there
        let perm
        if(userData.class == "Lehrer") {
            perm = "Lehrperson"
        }
        else {
            perm = "Lernender"
        }

        let insert = await db("users").insert({
            username:userData.username,
            fullname: userData.fullname,
            class: userData.class,
            section: userData.section,
            perm:perm
        }).catch(err => {
            res.status(500).json({status:false,error:true,message:"server error"})
        })

        res.json({status:true,error:false,message:"success"})
    }
    else {
        // some values empty
        res.status(400).json({status:false,error:true,message:"invalid request"})
    }
    res.json({status:true})
})

// endpoint: [ GET '/api/users/getLocalUID' ]
// gets ID of local user by username ( sAMAccountName )
router.get("/getLocalUID", async (req, res) => {
    let username = req.query.username

    if(username == undefined || username == "") {
        res.status(400).json({status:false,message:"invalid request"})
    }
    let result = await db("users").where({username:username})

    if(result.length == 0) {
        res.status(404).json({status:false,message:"user not found"})
    }
    else {
        res.json({status:true,uid:result[0].ID,perm:result[0].perm})
    }
})

// endpoint: [ GET '/api/users/getUserFull' ]
// searches for users in LDAP by fullname
router.get("/getUserFull", (req, res) => {
    let fullName = req.query.querystring
    let cn = `cn=*${fullName}*`
    ad.findUsers(cn, true, (err, users) => {
        if(err) {
            res.status(500).json({status:false,message:"internal server error"})
        }
        else {
            if(!users || users.length == 0) {
                res.status(404).json({status:false,message:"no users found"})
            }
            else {
                if(users.length > 5) {
                    users = users.slice(0,4)
                }   
                res.json({status:true,data:users})
            }
        }
    })
})

// endpoint: [ POST '/api/users/generateToken' ]
// generates JSON-WebToken for authentication
router.post("/generateToken", async (req, res) => {
    let payload = req.body
    let duration = 68400 // time in seconds (19 hours)

    let token = jwt.createToken(payload, duration)

    if(token == undefined) {
        res.status(500).json({status:false,error:true,message:"internal server error"})
    }

    res.json({status:true,error:false,token:token})
})

// endpoint: [ GET '/api/users/getLocalUserByID' ]
// gets local user object by UID
router.get("/getLocalUserByID", async (req, res) => {
    let uid = req.query.uid

    if(uid == undefined) {
        res.status(400).json({status:false,message:"invalid request"})
    }
    else {
        let result = await db("users").where({ID:uid})
        if(result.length == 0) {
            res.status(404).json({status:false,message:"user not found"})
        }
        else {
            res.json({status:true,data:result[0]})
        }
    }
})

// endpoint: [ GET '/api/users/getAllClasses' ]
// returns array of all classes
router.get("/getAllClasses", async (req, res) => {
    let dbRes = await db("users")
    let result = []

    dbRes.forEach(entry => {
        if(!result.includes(entry.class)) {
            result.push(entry.class)
        }
    })
    if(result == undefined) {
        res.status(500).json({status:false,message:"server error"})
    }
    if(result.length == 0) {
        res.status(404).json({status:false,message:"not found"})
    }
    else {
        res.json({status:true,data:result})
    }
})

// endpoint: [ GET '/api/users/getFullName' ]
// returns fullname of user by sAMAccountName
router.get("/getFullName", async (req, res) => {
    let sAMAccountname = req.query.username
    let user = await findUser(sAMAccountname)
    res.json({status:true,fullname:user.data.fullname})
})

// export router object
module.exports = router