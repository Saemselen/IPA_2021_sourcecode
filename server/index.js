/*

 * Path: '/server/index.js'
 * Author: Samis Moser
 * Desc: Server-File (Backend)

*/

// import packages
const express = require("express")
const cors = require("cors")

// import middleware
const logger = require("./middleware/logger")
const auth = require("./middleware/auth")

// import config
const config = require("./config.json")

// global variables
const port = process.env.port | config.port
const staticRoot = "../client_build"

const projectRoutes = require("./api/projects")
const userRoutes = require("./api/users")
const technologyRoutes = require("./api/technologies")

// create instance of express 
const app = express()

// use middleware

app.use("/", logger)
app.use(cors())
//app.use(express.static(staticRoot))
app.use(express.json())

// API routes
app.use("/api/projects", auth, projectRoutes)
app.use("/api/users", userRoutes)
app.use("/api/technologies", auth, technologyRoutes)

// listen on port
app.listen(port, () => {
    console.clear()
    console.log(`> server listening on port ${port}`)
})